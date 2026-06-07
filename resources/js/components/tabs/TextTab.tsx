import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface SearchCriteria {
    query?: string | null;
    type?: string | null;
    purpose?: string | null;
    bedrooms_min?: number | null;
    bedrooms_max?: number | null;
    bathrooms_min?: number | null;
    city?: string | null;
    district?: string | null;
    price_min?: number | null;
    price_max?: number | null;
    sqm_min?: number | null;
    sqm_max?: number | null;
    condition?: string | null;
    year_built_min?: number | null;
}

interface PropertyResult {
    id: number;
    title: string;
    price: number;
    sqm: number;
    bedrooms: number;
    bathrooms: number;
    type: string | null;
    city: string;
    purpose: string;
    url: string;
    image_url: string;
    created_at: string;
}

interface SearchResultsData {
    criteria: SearchCriteria;
    results: PropertyResult[];
    count: number;
    error?: string;
    applied_filters?: Record<string, unknown>;
    dropped_filters?: string[];
}

interface TextContentSettings {
    content_tab_ai_search_description?: string;
    content_tab_ai_search_placeholder?: string;
    content_button_search?: string;
}

interface TextTabProps {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: FormEventHandler;
    searchResults: SearchResultsData | null;
    processing: boolean;
    content?: TextContentSettings;
}

function formatFilterLabel(key: string): string {
    const labels: Record<string, string> = {
        purpose: 'Purpose',
        type: 'Type',
        city: 'City',
        bedrooms: 'Bedrooms',
        price: 'Price',
        sqm: 'Area',
        condition: 'Condition',
    };
    return labels[key] || key;
}

function formatLabel(key: string): string {
    const labels: Record<string, string> = {
        query: 'Summary',
        type: 'Type',
        purpose: 'Purpose',
        bedrooms_min: 'Bedrooms (min)',
        bedrooms_max: 'Bedrooms (max)',
        bathrooms_min: 'Bathrooms (min)',
        city: 'City',
        district: 'District',
        price_min: 'Min Price',
        price_max: 'Max Price',
        sqm_min: 'Min Area (m²)',
        sqm_max: 'Max Area (m²)',
        condition: 'Condition',
        year_built_min: 'Year Built (min)',
    };
    return labels[key] || key;
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

export default function TextTab({ value, onValueChange, onSubmit, searchResults, processing, content }: TextTabProps) {
    const c = content ?? {};

    const description = c.content_tab_ai_search_description || 'Fill me from admin/settings page';
    const placeholder = c.content_tab_ai_search_placeholder || 'Fill me from admin/settings page';
    const buttonText = c.content_button_search || 'Fill me from admin/settings page';

    return (
        <div className="flex flex-col w-full gap-6">
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] leading-relaxed">
                {description}
            </p>
            <form onSubmit={onSubmit} className="flex flex-col w-full gap-3">
                <textarea
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button type="submit" className="h-14 px-8 text-lg self-start" disabled={processing}>
                    {processing ? 'Searching...' : buttonText}
                </Button>
            </form>

            {searchResults && (
                <div className="w-full text-left space-y-6">
                    {searchResults.error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                            {searchResults.error}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Extracted Criteria</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                    {Object.entries(searchResults.criteria).map(([key, val]) => {
                                        if (key === 'query') return null;
                                        if (val === null || val === undefined) return null;
                                        return (
                                            <div key={key}>
                                                <span className="text-gray-400">{formatLabel(key)}:</span>{' '}
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{formatValue(val)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {searchResults.criteria.query && (
                                    <p className="mt-3 text-sm text-gray-600 italic dark:text-gray-400">
                                        "{searchResults.criteria.query}"
                                    </p>
                                )}
                            </div>

                            {searchResults.dropped_filters && searchResults.dropped_filters.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                                    <strong>Note:</strong> Not enough data to filter by{' '}
                                    {searchResults.dropped_filters.map(formatFilterLabel).join(', ')}.
                                    Showing results without those filters.
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                                    Matching Properties ({searchResults.count})
                                </h3>
                                {searchResults.count === 0 ? (
                                    <p className="text-sm text-gray-400">No properties match your criteria.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {searchResults.results.map((prop) => (
                                            <Link
                                                key={prop.id}
                                                href={route('property.show', prop.id)}
                                                className="block rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all dark:border-gray-700 dark:hover:border-blue-600"
                                            >
                                                {prop.image_url && (
                                                    <img
                                                        src={prop.image_url}
                                                        alt={prop.title}
                                                        className="w-full h-40 object-cover rounded-lg mb-3"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                )}
                                                <div className="space-y-1 text-sm">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {prop.title || 'Property'}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-blue-600">€{Number(prop.price).toLocaleString()}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                                                            prop.purpose === 'rent'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                        }`}>
                                                            {prop.purpose}
                                                        </span>
                                                        {prop.type && (
                                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                                                {prop.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500">
                                                        {prop.city}{prop.sqm ? ` · ${prop.sqm} m²` : ''}
                                                        {prop.bedrooms ? ` · ${prop.bedrooms} bed` : ''}
                                                        {prop.bathrooms ? ` · ${prop.bathrooms} bath` : ''}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
