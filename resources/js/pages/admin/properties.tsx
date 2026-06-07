import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Property {
    id: number;
    title: string | null;
    source_url: string;
    source_website: string;
    price: number | null;
    sqm: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    purpose: string | null;
    type: string | null;
    city: string | null;
    created_at: string;
    scraped_at: string | null;
}

interface PaginatedData<T> {
    data: T[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

interface PropertiesPageProps {
    properties: PaginatedData<Property>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Properties', href: '/admin/properties' },
];

function formatPrice(n: number | null): string {
    if (n === null) return 'N/A';
    return '€' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AdminProperties({ properties }: PropertiesPageProps) {
    const { error, success } = usePage<{ error?: string; success?: string }>().props;
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [processing, setProcessing] = useState(false);

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(properties.data.map(p => p.id)));
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id: number) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };

    const handleRecrawl = () => {
        if (selected.size === 0) return;
        if (!confirm(`Re-crawl ${selected.size} selected propert${selected.size === 1 ? 'y' : 'ies'}?`)) return;
        setProcessing(true);
        router.post(route('admin.properties.recrawl'), { ids: Array.from(selected) }, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (property: Property) => {
        if (confirm(`Delete property "${property.title ?? 'Untitled'}"?`)) {
            router.delete(route('admin.properties.destroy', property.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Properties" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">All Properties ({properties.total})</h2>
                        {selected.size > 0 && (
                            <Button variant="outline" size="sm" onClick={handleRecrawl} disabled={processing}>
                                {processing ? 'Re-crawling...' : `Re-crawl Selected (${selected.size})`}
                            </Button>
                        )}
                    </div>
                    <Button asChild>
                        <Link href={route('admin.properties.crawl')}>+ Crawl New</Link>
                    </Button>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 whitespace-pre-line">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400 whitespace-pre-line">
                        {success}
                    </div>
                )}

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        checked={properties.data.length > 0 && selected.size === properties.data.length}
                                        onChange={(e) => toggleAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Source</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Size</th>
                                <th className="px-4 py-3 font-medium">Rooms</th>
                                <th className="px-4 py-3 font-medium">Purpose</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">City</th>
                                <th className="px-4 py-3 font-medium">Scraped</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.data.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                        No properties yet. Use the Crawl page to import one.
                                    </td>
                                </tr>
                            ) : (
                                properties.data.map((property) => (
                                    <tr key={property.id} className="border-b border-sidebar-border/70 last:border-0 dark:border-sidebar-border">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="cursor-pointer"
                                                checked={selected.has(property.id)}
                                                onChange={() => toggleOne(property.id)}
                                            />
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 font-medium">
                                            <a href={property.source_url} target="_blank" className="hover:underline">
                                                {property.title ?? 'Untitled'}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {property.source_website}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{formatPrice(property.price)}</td>
                                        <td className="px-4 py-3">{property.sqm ? property.sqm + ' m²' : 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            {[property.bedrooms ? property.bedrooms + ' bed' : '', property.bathrooms ? property.bathrooms + ' bath' : ''].filter(Boolean).join(', ') || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {property.purpose ? (
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    property.purpose === 'sale' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                    {property.purpose}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {property.type ? (
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">{property.city ?? 'N/A'}</td>
                                        <td className="px-4 py-3 text-[#706f6c] dark:text-[#A1A09A]">
                                            {property.scraped_at ? new Date(property.scraped_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('property.show', property.id)}>View</Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(property)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {properties.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <span>Showing {properties.from}–{properties.to} of {properties.total}</span>
                        <div className="flex gap-2">
                            {properties.current_page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('admin.properties.index', { page: properties.current_page - 1 })}>Previous</Link>
                                </Button>
                            )}
                            {properties.current_page < properties.last_page && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('admin.properties.index', { page: properties.current_page + 1 })}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
