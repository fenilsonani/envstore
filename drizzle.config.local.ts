import type { Config } from 'drizzle-kit';

export default {
    schema: './src/server/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:local.db',
    },
} satisfies Config;
