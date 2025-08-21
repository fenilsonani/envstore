import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'API Documentation (Coming Soon)',
	description:
		'Full API reference and guides are on the way. Explore examples on the home page and manage keys in the dashboard meanwhile.',
};

export default function ApiDocsComingSoon() {
	return (
		<main className="mx-auto max-w-6xl px-6 py-20 md:py-28">
			<section className="relative text-center">
				<div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent_70%)]">
					<div className="mx-auto h-56 max-w-4xl bg-[radial-gradient(ellipse_at_center,oklch(0.828_0.189_84.429)/20%,transparent_60%)]" />
				</div>
				<p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
					<Clock className="size-4" /> Work in progress
				</p>
				<h1 className="text-3xl font-semibold tracking-tight">API Documentation</h1>
				<p className="mt-2 text-muted-foreground">
					We’re crafting great docs. In the meantime, use the examples on the home page or manage keys in the dashboard.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Button asChild className="px-6">
						<Link href="/dashboard">Go to dashboard</Link>
					</Button>
					<Button variant="outline" asChild className="px-6">
						<Link href="/">Back to home</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}


