import type { AppRouter } from '@/server/trpc/router';

declare global {
    type EnvstoreAppRouter = AppRouter;
}
export {};
