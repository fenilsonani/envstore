import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';
import {
    projects,
    envFiles,
    apiKeys,
    users,
    organizations,
    organizationMembers,
    organizationInvitations,
    auditLogs,
} from '../db/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { encryptString, decryptString } from '../crypto';
import { randomUUID } from 'node:crypto';
import crypto from 'node:crypto';

const t = initTRPC.context<Context>().create();
const enforceUser = t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
});
const protectedProcedure = t.procedure.use(enforceUser);

// Helper: Check if user has access to organization
async function checkOrganizationAccess(
    db: Context['db'],
    userId: string,
    organizationId: string,
    requiredRole?: 'owner' | 'admin' | 'member' | 'viewer'
) {
    const member = await db
        .select()
        .from(organizationMembers)
        .where(
            and(
                eq(organizationMembers.organizationId, organizationId),
                eq(organizationMembers.userId, userId)
            )
        )
        .limit(1);

    if (!member[0]) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this organization',
        });
    }

    if (requiredRole) {
        const roleHierarchy = { owner: 4, admin: 3, member: 2, viewer: 1 };
        const userRole =
            roleHierarchy[member[0].role as keyof typeof roleHierarchy] || 0;
        const required =
            roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

        if (userRole < required) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: 'Insufficient permissions',
            });
        }
    }

    return member[0];
}

// Helper: Create slug from name
function createSlug(name: string): string {
    return (
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') +
        '-' +
        crypto.randomBytes(4).toString('hex')
    );
}

// Helper: Log audit event
async function logAudit(
    db: Context['db'],
    {
        organizationId,
        userId,
        action,
        resourceType,
        resourceId,
        metadata,
    }: {
        organizationId: string;
        userId: string;
        action: string;
        resourceType: string;
        resourceId?: string;
        metadata?: Record<string, unknown>;
    }
) {
    await db.insert(auditLogs).values({
        id: randomUUID(),
        organizationId,
        userId,
        action,
        resourceType,
        resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: null, // Can be added from request context
        userAgent: null, // Can be added from request context
    });
}

// Helper: Get or create personal organization for user
async function getOrCreatePersonalOrganization(db: Context['db'], userId: string): Promise<string> {
    // Check if user already has a personal organization
    const existingPersonalOrg = await db
        .select()
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(
            and(
                eq(organizationMembers.userId, userId),
                eq(organizations.isPersonal, true)
            )
        )
        .limit(1);

    if (existingPersonalOrg[0]) {
        return existingPersonalOrg[0].organizations.id;
    }

    // Create personal organization
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userName = user[0]?.email.split('@')[0] || 'user';
    const orgId = randomUUID();
    const slug = createSlug(`${userName}-personal`);

    await db.insert(organizations).values({
        id: orgId,
        name: `${userName}'s Personal`,
        slug,
        ownerId: userId,
        isPersonal: true,
    });

    // Add user as owner
    await db.insert(organizationMembers).values({
        id: randomUUID(),
        organizationId: orgId,
        userId,
        role: 'owner',
    });

    return orgId;
}

export const appRouter = t.router({
    createProject: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                organizationId: z.string().uuid().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Use provided organization or default to personal organization
            const organizationId =
                input.organizationId ||
                (await getOrCreatePersonalOrganization(ctx.db, ctx.userId!));

            // Check if user has access to the organization
            if (input.organizationId) {
                await checkOrganizationAccess(
                    ctx.db,
                    ctx.userId!,
                    input.organizationId,
                    'member'
                );
            }

            const id = randomUUID();
            await ctx.db
                .insert(projects)
                .values({
                    id,
                    name: input.name,
                    organizationId,
                    ownerId: ctx.userId!,
                });

            await logAudit(ctx.db, {
                organizationId,
                userId: ctx.userId!,
                action: 'project.created',
                resourceType: 'project',
                resourceId: id,
                metadata: { name: input.name },
            });

            return { id, name: input.name };
        }),

    renameProject: protectedProcedure
        .input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.id),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            await ctx.db
                .update(projects)
                .set({ name: input.name })
                .where(eq(projects.id, input.id));
            return { id: input.id, name: input.name };
        }),

    deleteProject: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.id),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            // Delete env files first, then the project
            await ctx.db
                .delete(envFiles)
                .where(eq(envFiles.projectId, input.id));
            await ctx.db.delete(projects).where(eq(projects.id, input.id));
            return { success: true };
        }),

    listProjects: protectedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select()
            .from(projects)
            .where(eq(projects.ownerId, ctx.userId!));
        return rows;
    }),

    // Projects with aggregated stats (environment count and last activity)
    listProjectsWithStats: protectedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select({
                id: projects.id,
                name: projects.name,
                createdAt: projects.createdAt,
                environmentsCount:
                    sql<string>`count(distinct ${envFiles.environment})`,
                lastActivity: sql<number | null>`max(${envFiles.createdAt})`,
            })
            .from(projects)
            .leftJoin(envFiles, eq(envFiles.projectId, projects.id))
            .where(eq(projects.ownerId, ctx.userId!))
            .groupBy(projects.id);
        return rows.map((r) => ({
            id: r.id,
            name: r.name,
            createdAt: r.createdAt,
            environmentsCount: parseInt(r.environmentsCount, 10),
            lastActivity: r.lastActivity,
        }));
    }),

    uploadEnv: protectedProcedure
        .input(
            z.union([
                z.object({
                    projectId: z.string().uuid(),
                    environment: z.string().min(1),
                    content: z.string().min(1),
                    passphrase: z.string().min(8),
                }),
                z.object({
                    projectId: z.string().uuid(),
                    environment: z.string().min(1),
                    ciphertext: z.string().min(1),
                    iv: z.string().min(1),
                    salt: z.string().min(1),
                    checksum: z.string().min(1),
                }),
            ])
        )
        .mutation(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            const latest = await ctx.db
                .select({ version: envFiles.version })
                .from(envFiles)
                .where(
                    and(
                        eq(envFiles.projectId, input.projectId),
                        eq(envFiles.environment, input.environment)
                    )
                )
                .orderBy(desc(envFiles.version))
                .limit(1);
            const nextVersion = latest[0]?.version ? latest[0].version + 1 : 1;
            let payload: {
                ciphertext: string;
                iv: string;
                salt: string;
                checksum: string;
            };
            if ('content' in input) {
                payload = await encryptString(input.content, input.passphrase);
            } else {
                payload = {
                    ciphertext: input.ciphertext,
                    iv: input.iv,
                    salt: input.salt,
                    checksum: input.checksum,
                };
            }
            const id = randomUUID();
            await ctx.db.insert(envFiles).values({
                id,
                projectId: input.projectId,
                environment: input.environment,
                version: nextVersion,
                ...payload,
            });
            return { id, version: nextVersion };
        }),

    listEnvs: protectedProcedure
        .input(z.object({ projectId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            const rows = await ctx.db
                .select({
                    environment: envFiles.environment,
                    latestVersion: sql`max(${envFiles.version})`.as(
                        'latestVersion'
                    ),
                })
                .from(envFiles)
                .where(eq(envFiles.projectId, input.projectId))
                .groupBy(envFiles.environment);
            return rows as Array<{
                environment: string;
                latestVersion: number;
            }>;
        }),

    listEnvVersions: protectedProcedure
        .input(
            z.object({
                projectId: z.string().uuid(),
                environment: z.string().min(1),
            })
        )
        .query(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            const rows = await ctx.db
                .select({
                    id: envFiles.id,
                    version: envFiles.version,
                    createdAt: envFiles.createdAt,
                    checksum: envFiles.checksum,
                })
                .from(envFiles)
                .where(
                    and(
                        eq(envFiles.projectId, input.projectId),
                        eq(envFiles.environment, input.environment)
                    )
                )
                .orderBy(desc(envFiles.version));
            return rows;
        }),

    getEnvCipher: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const rows = await ctx.db
                .select()
                .from(envFiles)
                .where(eq(envFiles.id, input.id))
                .limit(1);
            const record = rows[0];
            if (!record) return null;
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, record.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            return {
                id: record.id,
                projectId: record.projectId,
                environment: record.environment,
                version: record.version,
                createdAt: record.createdAt,
                ciphertext: record.ciphertext,
                iv: record.iv,
                salt: record.salt,
                checksum: record.checksum,
            };
        }),

    getLatestEnv: protectedProcedure
        .input(
            z.object({
                projectId: z.string().uuid(),
                environment: z.string().min(1),
            })
        )
        .query(async ({ ctx, input }) => {
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            const rows = await ctx.db
                .select()
                .from(envFiles)
                .where(
                    and(
                        eq(envFiles.projectId, input.projectId),
                        eq(envFiles.environment, input.environment)
                    )
                )
                .orderBy(desc(envFiles.version))
                .limit(1);
            return rows[0] ?? null;
        }),

    decryptEnv: protectedProcedure
        .input(
            z.object({ id: z.string().uuid(), passphrase: z.string().min(8) })
        )
        .mutation(async ({ ctx, input }) => {
            const rows = await ctx.db
                .select()
                .from(envFiles)
                .where(eq(envFiles.id, input.id))
                .limit(1);
            const record = rows[0];
            if (!record) return null;
            const proj = await ctx.db
                .select()
                .from(projects)
                .where(
                    and(
                        eq(projects.id, record.projectId),
                        eq(projects.ownerId, ctx.userId!)
                    )
                )
                .limit(1);
            if (!proj[0]) throw new TRPCError({ code: 'NOT_FOUND' });
            const plaintext = await decryptString(
                record.ciphertext,
                input.passphrase,
                record.iv,
                record.salt
            );
            return { content: plaintext, checksum: record.checksum };
        }),

    createApiKey: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const { token, prefix } = await (
                await import('../auth')
            ).createApiKey(ctx.userId!, input.name);
            return { token, prefix };
        }),

    listApiKeys: protectedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select()
            .from(apiKeys)
            .where(
                and(eq(apiKeys.userId, ctx.userId!), isNull(apiKeys.revokedAt))
            );
        return rows.map((k) => ({
            id: k.id,
            name: k.name,
            prefix: k.prefix,
            createdAt: k.createdAt,
            lastUsedAt: k.lastUsedAt,
        }));
    }),

    revokeApiKey: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(apiKeys)
                .set({ revokedAt: new Date() })
                .where(
                    and(
                        eq(apiKeys.id, input.id),
                        eq(apiKeys.userId, ctx.userId!)
                    )
                );
            return { success: true };
        }),

    getUserProfile: protectedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select()
            .from(users)
            .where(eq(users.id, ctx.userId!))
            .limit(1);
        const user = rows[0];
        if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };
    }),

    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
        const projectsCount = await ctx.db
            .select({ count: sql`count(*)`.as('count') })
            .from(projects)
            .where(eq(projects.ownerId, ctx.userId!));
        const apiKeysCount = await ctx.db
            .select({ count: sql`count(*)`.as('count') })
            .from(apiKeys)
            .where(
                and(eq(apiKeys.userId, ctx.userId!), isNull(apiKeys.revokedAt))
            );
        const environmentsCount = await ctx.db
            .select({
                count: sql`count(distinct ${envFiles.environment})`.as('count'),
            })
            .from(envFiles)
            .innerJoin(projects, eq(envFiles.projectId, projects.id))
            .where(eq(projects.ownerId, ctx.userId!));

        return {
            projects: Number(projectsCount[0]?.count || 0),
            apiKeys: Number(apiKeysCount[0]?.count || 0),
            environments: Number(environmentsCount[0]?.count || 0),
            storageUsed: 0, // Could be calculated from total ciphertext length if needed
        };
    }),

    changePassword: protectedProcedure
        .input(
            z.object({
                currentPassword: z.string().min(1),
                newPassword: z.string().min(8),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const rows = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, ctx.userId!))
                .limit(1);
            const user = rows[0];
            if (!user || !user.passwordHash)
                throw new TRPCError({ code: 'NOT_FOUND' });

            const { verifyPassword, hashPassword } = await import('../auth');
            const isCurrentPasswordValid = await verifyPassword(
                user.passwordHash,
                input.currentPassword
            );
            if (!isCurrentPasswordValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Current password is incorrect',
                });
            }

            const newPasswordHash = await hashPassword(input.newPassword);
            await ctx.db
                .update(users)
                .set({ passwordHash: newPasswordHash })
                .where(eq(users.id, ctx.userId!));

            return { success: true };
        }),

    deleteAllUserData: protectedProcedure
        .input(z.object({ confirmPassword: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const rows = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, ctx.userId!))
                .limit(1);
            const user = rows[0];
            if (!user || !user.passwordHash)
                throw new TRPCError({ code: 'NOT_FOUND' });

            const { verifyPassword } = await import('../auth');
            const isPasswordValid = await verifyPassword(
                user.passwordHash,
                input.confirmPassword
            );
            if (!isPasswordValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Password is incorrect',
                });
            }

            // Delete user's projects (this will cascade to envFiles due to foreign key)
            const userProjects = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.ownerId, ctx.userId!));
            for (const project of userProjects) {
                await ctx.db
                    .delete(envFiles)
                    .where(eq(envFiles.projectId, project.id));
            }
            await ctx.db
                .delete(projects)
                .where(eq(projects.ownerId, ctx.userId!));

            // Delete user's API keys
            await ctx.db.delete(apiKeys).where(eq(apiKeys.userId, ctx.userId!));

            return { success: true };
        }),

    deleteAccount: protectedProcedure
        .input(z.object({ confirmPassword: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const rows = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, ctx.userId!))
                .limit(1);
            const user = rows[0];
            if (!user || !user.passwordHash)
                throw new TRPCError({ code: 'NOT_FOUND' });

            const { verifyPassword } = await import('../auth');
            const isPasswordValid = await verifyPassword(
                user.passwordHash,
                input.confirmPassword
            );
            if (!isPasswordValid) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Password is incorrect',
                });
            }

            // Delete all user data first
            const userProjects = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.ownerId, ctx.userId!));
            for (const project of userProjects) {
                await ctx.db
                    .delete(envFiles)
                    .where(eq(envFiles.projectId, project.id));
            }
            await ctx.db
                .delete(projects)
                .where(eq(projects.ownerId, ctx.userId!));
            await ctx.db.delete(apiKeys).where(eq(apiKeys.userId, ctx.userId!));

            // Finally delete the user account
            await ctx.db.delete(users).where(eq(users.id, ctx.userId!));

            return { success: true };
        }),

    // ========== ORGANIZATION MANAGEMENT ==========

    // Create a new organization (team/workspace)
    createOrganization: protectedProcedure
        .input(z.object({ name: z.string().min(1).max(100) }))
        .mutation(async ({ ctx, input }) => {
            const id = randomUUID();
            const slug = createSlug(input.name);

            // Create organization
            await ctx.db.insert(organizations).values({
                id,
                name: input.name,
                slug,
                ownerId: ctx.userId!,
                isPersonal: false,
            });

            // Add creator as owner member
            await ctx.db.insert(organizationMembers).values({
                id: randomUUID(),
                organizationId: id,
                userId: ctx.userId!,
                role: 'owner',
            });

            // Log audit event
            await logAudit(ctx.db, {
                organizationId: id,
                userId: ctx.userId!,
                action: 'organization.created',
                resourceType: 'organization',
                resourceId: id,
                metadata: { name: input.name },
            });

            return { id, name: input.name, slug };
        }),

    // List organizations user has access to
    listOrganizations: protectedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select({
                id: organizations.id,
                name: organizations.name,
                slug: organizations.slug,
                isPersonal: organizations.isPersonal,
                role: organizationMembers.role,
                createdAt: organizations.createdAt,
            })
            .from(organizationMembers)
            .innerJoin(
                organizations,
                eq(organizationMembers.organizationId, organizations.id)
            )
            .where(eq(organizationMembers.userId, ctx.userId!));

        return rows;
    }),

    // Get organization details
    getOrganization: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            await checkOrganizationAccess(ctx.db, ctx.userId!, input.id);

            const org = await ctx.db
                .select()
                .from(organizations)
                .where(eq(organizations.id, input.id))
                .limit(1);

            if (!org[0]) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            // Get member count
            const memberCount = await ctx.db
                .select({ count: sql`count(*)`.as('count') })
                .from(organizationMembers)
                .where(eq(organizationMembers.organizationId, input.id));

            // Get project count
            const projectCount = await ctx.db
                .select({ count: sql`count(*)`.as('count') })
                .from(projects)
                .where(eq(projects.organizationId, input.id));

            return {
                ...org[0],
                memberCount: Number(memberCount[0]?.count || 0),
                projectCount: Number(projectCount[0]?.count || 0),
            };
        }),

    // Update organization
    updateOrganization: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).max(100),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await checkOrganizationAccess(ctx.db, ctx.userId!, input.id, 'admin');

            await ctx.db
                .update(organizations)
                .set({
                    name: input.name,
                    updatedAt: new Date(),
                })
                .where(eq(organizations.id, input.id));

            await logAudit(ctx.db, {
                organizationId: input.id,
                userId: ctx.userId!,
                action: 'organization.updated',
                resourceType: 'organization',
                resourceId: input.id,
                metadata: { name: input.name },
            });

            return { success: true };
        }),

    // Delete organization
    deleteOrganization: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await checkOrganizationAccess(ctx.db, ctx.userId!, input.id, 'owner');

            // Check if personal organization
            const org = await ctx.db
                .select()
                .from(organizations)
                .where(eq(organizations.id, input.id))
                .limit(1);

            if (org[0]?.isPersonal) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot delete personal organization',
                });
            }

            await ctx.db
                .delete(organizations)
                .where(eq(organizations.id, input.id));

            return { success: true };
        }),

    // ========== TEAM MEMBER MANAGEMENT ==========

    // List organization members
    listOrganizationMembers: protectedProcedure
        .input(z.object({ organizationId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                input.organizationId
            );

            const members = await ctx.db
                .select({
                    id: organizationMembers.id,
                    userId: organizationMembers.userId,
                    role: organizationMembers.role,
                    joinedAt: organizationMembers.joinedAt,
                    email: users.email,
                })
                .from(organizationMembers)
                .innerJoin(users, eq(organizationMembers.userId, users.id))
                .where(
                    eq(organizationMembers.organizationId, input.organizationId)
                );

            return members;
        }),

    // Invite member to organization
    inviteMember: protectedProcedure
        .input(
            z.object({
                organizationId: z.string().uuid(),
                email: z.string().email(),
                role: z.enum(['admin', 'member', 'viewer']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                input.organizationId,
                'admin'
            );

            // Check if user already exists
            const existingUser = await ctx.db
                .select()
                .from(users)
                .where(eq(users.email, input.email))
                .limit(1);

            // Check if already a member
            if (existingUser[0]) {
                const existingMember = await ctx.db
                    .select()
                    .from(organizationMembers)
                    .where(
                        and(
                            eq(
                                organizationMembers.organizationId,
                                input.organizationId
                            ),
                            eq(organizationMembers.userId, existingUser[0].id)
                        )
                    )
                    .limit(1);

                if (existingMember[0]) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'User is already a member',
                    });
                }
            }

            // Create invitation
            const id = randomUUID();
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            await ctx.db.insert(organizationInvitations).values({
                id,
                organizationId: input.organizationId,
                email: input.email,
                role: input.role,
                invitedBy: ctx.userId!,
                token,
                status: 'pending',
                expiresAt,
            });

            await logAudit(ctx.db, {
                organizationId: input.organizationId,
                userId: ctx.userId!,
                action: 'member.invited',
                resourceType: 'invitation',
                resourceId: id,
                metadata: { email: input.email, role: input.role },
            });

            // TODO: Send invitation email
            // In a real app, you would send an email with the invitation link here

            return { id, token };
        }),

    // List pending invitations
    listInvitations: protectedProcedure
        .input(z.object({ organizationId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                input.organizationId,
                'admin'
            );

            const invitations = await ctx.db
                .select({
                    id: organizationInvitations.id,
                    email: organizationInvitations.email,
                    role: organizationInvitations.role,
                    status: organizationInvitations.status,
                    createdAt: organizationInvitations.createdAt,
                    expiresAt: organizationInvitations.expiresAt,
                    invitedBy: organizationInvitations.invitedBy,
                })
                .from(organizationInvitations)
                .where(
                    and(
                        eq(
                            organizationInvitations.organizationId,
                            input.organizationId
                        ),
                        eq(organizationInvitations.status, 'pending')
                    )
                );

            return invitations;
        }),

    // Accept invitation
    acceptInvitation: protectedProcedure
        .input(z.object({ token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const invitation = await ctx.db
                .select()
                .from(organizationInvitations)
                .where(eq(organizationInvitations.token, input.token))
                .limit(1);

            if (!invitation[0]) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Invitation not found',
                });
            }

            if (invitation[0].status !== 'pending') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invitation is no longer valid',
                });
            }

            if (invitation[0].expiresAt < new Date()) {
                await ctx.db
                    .update(organizationInvitations)
                    .set({ status: 'expired' })
                    .where(eq(organizationInvitations.id, invitation[0].id));

                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invitation has expired',
                });
            }

            // Get user email
            const user = await ctx.db
                .select()
                .from(users)
                .where(eq(users.id, ctx.userId!))
                .limit(1);

            if (user[0]?.email !== invitation[0].email) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'This invitation is for a different email address',
                });
            }

            // Add user as member
            await ctx.db.insert(organizationMembers).values({
                id: randomUUID(),
                organizationId: invitation[0].organizationId,
                userId: ctx.userId!,
                role: invitation[0].role,
            });

            // Update invitation status
            await ctx.db
                .update(organizationInvitations)
                .set({
                    status: 'accepted',
                    acceptedAt: new Date(),
                })
                .where(eq(organizationInvitations.id, invitation[0].id));

            await logAudit(ctx.db, {
                organizationId: invitation[0].organizationId,
                userId: ctx.userId!,
                action: 'member.joined',
                resourceType: 'member',
                resourceId: ctx.userId!,
                metadata: { role: invitation[0].role },
            });

            return { success: true };
        }),

    // Revoke invitation
    revokeInvitation: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const invitation = await ctx.db
                .select()
                .from(organizationInvitations)
                .where(eq(organizationInvitations.id, input.id))
                .limit(1);

            if (!invitation[0]) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                invitation[0].organizationId,
                'admin'
            );

            await ctx.db
                .update(organizationInvitations)
                .set({ status: 'revoked' })
                .where(eq(organizationInvitations.id, input.id));

            await logAudit(ctx.db, {
                organizationId: invitation[0].organizationId,
                userId: ctx.userId!,
                action: 'invitation.revoked',
                resourceType: 'invitation',
                resourceId: input.id,
            });

            return { success: true };
        }),

    // Update member role
    updateMemberRole: protectedProcedure
        .input(
            z.object({
                memberId: z.string().uuid(),
                role: z.enum(['owner', 'admin', 'member', 'viewer']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const member = await ctx.db
                .select()
                .from(organizationMembers)
                .where(eq(organizationMembers.id, input.memberId))
                .limit(1);

            if (!member[0]) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                member[0].organizationId,
                'admin'
            );

            // Cannot change your own role
            if (member[0].userId === ctx.userId!) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot change your own role',
                });
            }

            await ctx.db
                .update(organizationMembers)
                .set({ role: input.role })
                .where(eq(organizationMembers.id, input.memberId));

            await logAudit(ctx.db, {
                organizationId: member[0].organizationId,
                userId: ctx.userId!,
                action: 'member.role_updated',
                resourceType: 'member',
                resourceId: input.memberId,
                metadata: { newRole: input.role },
            });

            return { success: true };
        }),

    // Remove member from organization
    removeMember: protectedProcedure
        .input(z.object({ memberId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const member = await ctx.db
                .select()
                .from(organizationMembers)
                .where(eq(organizationMembers.id, input.memberId))
                .limit(1);

            if (!member[0]) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                member[0].organizationId,
                'admin'
            );

            // Cannot remove yourself (use leave instead)
            if (member[0].userId === ctx.userId!) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot remove yourself. Use leave instead.',
                });
            }

            // Cannot remove owner
            if (member[0].role === 'owner') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot remove organization owner',
                });
            }

            await ctx.db
                .delete(organizationMembers)
                .where(eq(organizationMembers.id, input.memberId));

            await logAudit(ctx.db, {
                organizationId: member[0].organizationId,
                userId: ctx.userId!,
                action: 'member.removed',
                resourceType: 'member',
                resourceId: input.memberId,
            });

            return { success: true };
        }),

    // Leave organization
    leaveOrganization: protectedProcedure
        .input(z.object({ organizationId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const member = await ctx.db
                .select()
                .from(organizationMembers)
                .where(
                    and(
                        eq(organizationMembers.organizationId, input.organizationId),
                        eq(organizationMembers.userId, ctx.userId!)
                    )
                )
                .limit(1);

            if (!member[0]) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }

            // Cannot leave if you're the owner
            if (member[0].role === 'owner') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message:
                        'Owners cannot leave. Transfer ownership or delete the organization.',
                });
            }

            await ctx.db
                .delete(organizationMembers)
                .where(eq(organizationMembers.id, member[0].id));

            await logAudit(ctx.db, {
                organizationId: input.organizationId,
                userId: ctx.userId!,
                action: 'member.left',
                resourceType: 'member',
                resourceId: member[0].id,
            });

            return { success: true };
        }),

    // ========== AUDIT LOGS ==========

    // Get audit logs for organization
    getAuditLogs: protectedProcedure
        .input(
            z.object({
                organizationId: z.string().uuid(),
                limit: z.number().min(1).max(100).default(50),
                offset: z.number().min(0).default(0),
            })
        )
        .query(async ({ ctx, input }) => {
            await checkOrganizationAccess(
                ctx.db,
                ctx.userId!,
                input.organizationId,
                'admin'
            );

            const logs = await ctx.db
                .select({
                    id: auditLogs.id,
                    action: auditLogs.action,
                    resourceType: auditLogs.resourceType,
                    resourceId: auditLogs.resourceId,
                    metadata: auditLogs.metadata,
                    createdAt: auditLogs.createdAt,
                    userId: auditLogs.userId,
                    userEmail: users.email,
                })
                .from(auditLogs)
                .innerJoin(users, eq(auditLogs.userId, users.id))
                .where(eq(auditLogs.organizationId, input.organizationId))
                .orderBy(desc(auditLogs.createdAt))
                .limit(input.limit)
                .offset(input.offset);

            return logs.map((log) => ({
                ...log,
                metadata: log.metadata ? JSON.parse(log.metadata as string) : null,
            }));
        }),
});

export type AppRouter = typeof appRouter;
