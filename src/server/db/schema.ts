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

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
        .notNull()
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

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type EnvFile = typeof envFiles.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
