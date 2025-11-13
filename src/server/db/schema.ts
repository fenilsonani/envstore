import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

// Organizations (Teams/Workspaces)
export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    ownerId: text('owner_id')
        .notNull()
        .references(() => users.id),
    isPersonal: integer('is_personal', { mode: 'boolean' })
        .notNull()
        .default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

// Organization Members with Roles
export const organizationMembers = sqliteTable('organization_members', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'member', 'viewer'] })
        .notNull()
        .default('member'),
    joinedAt: integer('joined_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

// Organization Invitations
export const organizationInvitations = sqliteTable('organization_invitations', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role', { enum: ['admin', 'member', 'viewer'] })
        .notNull()
        .default('member'),
    invitedBy: text('invited_by')
        .notNull()
        .references(() => users.id),
    token: text('token').notNull().unique(),
    status: text('status', { enum: ['pending', 'accepted', 'expired', 'revoked'] })
        .notNull()
        .default('pending'),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
    acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }),
});

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    // Keep ownerId for backward compatibility (can be removed in future)
    ownerId: text('owner_id')
        .references(() => users.id),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

export const envFiles = sqliteTable('env_files', {
    id: text('id').primaryKey(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id),
    environment: text('environment').notNull(),
    version: integer('version').notNull(),
    ciphertext: text('ciphertext').notNull(),
    salt: text('salt').notNull(),
    iv: text('iv').notNull(),
    checksum: text('checksum').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

export const apiKeys = sqliteTable('api_keys', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    name: text('name').notNull(),
    prefix: text('prefix').notNull(),
    hash: text('hash').notNull(),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
});

// Audit Logs for tracking team activities
export const auditLogs = sqliteTable('audit_logs', {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    action: text('action').notNull(), // e.g., 'project.created', 'env.updated', 'member.added'
    resourceType: text('resource_type').notNull(), // 'project', 'environment', 'member', etc.
    resourceId: text('resource_id'), // ID of the affected resource
    metadata: text('metadata', { mode: 'json' }), // Additional context as JSON
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(strftime('%s','now') * 1000)`),
});

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type OrganizationInvitation = typeof organizationInvitations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type EnvFile = typeof envFiles.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
