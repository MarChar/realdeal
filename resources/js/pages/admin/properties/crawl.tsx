import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Properties', href: '/admin/properties' },
    { title: 'Crawl', href: '/admin/properties/crawl' },
];

export default function AdminCrawlProperty() {
    const { error, success, savedProperty } = usePage<{ error?: string; success?: string; savedProperty?: number }>().props;

    const [url, setUrl] = useState('');
    const [urlProcessing, setUrlProcessing] = useState(false);

    const [sitemapUrl, setSitemapUrl] = useState('');
    const [sitemapLimit, setSitemapLimit] = useState('');
    const [sitemapProcessing, setSitemapProcessing] = useState(false);

    const handleUrlSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        setUrlProcessing(true);
        router.post(route('admin.properties.crawl.store'), { url: url.trim() }, {
            onFinish: () => setUrlProcessing(false),
        });
    };

    const handleSitemapSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!sitemapUrl.trim()) return;
        setSitemapProcessing(true);
        router.post(route('admin.properties.sitemap.crawl'), {
            sitemap_url: sitemapUrl.trim(),
            limit: sitemapLimit ? parseInt(sitemapLimit) : undefined,
        }, {
            onFinish: () => setSitemapProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crawl Properties" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 max-w-2xl">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 whitespace-pre-line">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400 whitespace-pre-line">
                        {success}
                        {savedProperty && (
                            <div className="mt-2">
                                <Link href={route('property.show', savedProperty)} className="font-medium underline">
                                    View property comparison →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <section>
                    <h2 className="text-lg font-semibold mb-1">Crawl Single URL</h2>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] mb-4">
                        Paste a Cyprus property listing URL to scrape its data and save it to the database.
                    </p>
                    <form onSubmit={handleUrlSubmit} className="flex gap-3">
                        <input
                            type="url"
                            placeholder="https://www.chris-michael.com.cy/property/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button type="submit" className="h-12 px-6 text-base" disabled={urlProcessing}>
                            {urlProcessing ? 'Crawling...' : 'Crawl'}
                        </Button>
                    </form>
                </section>

                <hr className="border-sidebar-border/70" />

                <section>
                    <h2 className="text-lg font-semibold mb-1">Crawl from Sitemap</h2>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] mb-4">
                        Paste a sitemap URL to discover and scrape all property listings at once.
                    </p>
                    <form onSubmit={handleSitemapSubmit} className="flex gap-3">
                        <input
                            type="url"
                            placeholder="https://www.chris-michael.com.cy/sitemap.xml"
                            value={sitemapUrl}
                            onChange={(e) => setSitemapUrl(e.target.value)}
                            className="flex-1 h-12 rounded-md border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <input
                            type="number"
                            min="1"
                            max="500"
                            placeholder="All"
                            value={sitemapLimit}
                            onChange={(e) => setSitemapLimit(e.target.value)}
                            className="w-20 h-12 rounded-md border border-input bg-background px-3 text-base text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            title="Number of items to crawl (leave empty for all)"
                        />
                        <Button type="submit" className="h-12 px-6 text-base" disabled={sitemapProcessing}>
                            {sitemapProcessing ? 'Crawling...' : 'Crawl Sitemap'}
                        </Button>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
}
