import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CodeBlock = dynamic(() => import('./CodeBlock'), {
    loading: () => (
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-lg" />
        </div>
    ),
    ssr: false,
});

export default CodeBlock;