import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';
import { projects, envFiles, apiKeys, users } from '../db/schema';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { encryptString, decryptString } from '../crypto';
import { randomUUID } from 'node:crypto';

const t = initTRPC.context<Context>().create();
const enforceUser = t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
});
const protectedProcedure = t.procedure.use(enforceUser);

export const appRouter = t.router({
    createProject: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const id = randomUUID();
            await ctx.db
                .insert(projects)
                .values({ id, name: input.name, ownerId: ctx.userId! });
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
});

export type AppRouter = typeof appRouter;
