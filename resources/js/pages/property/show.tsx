import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Property {
    id: number;
    title: string;
    price: number;
    price_per_sqm: number | null;
    sqm: number;
    type: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    year_built: number | null;
    condition: string | null;
    purpose: string | null;
    city: string | null;
    district: string | null;
    source_url: string;
    source_website: string;
    image_urls: string[];
    description: string | null;
}

interface SimilarProperty extends Property {
    similarity_score: number;
}

interface MarketAverages {
    price: number;
    price_per_sqm: number;
    year_built: number;
    condition: string | null;
}

interface Verdict {
    label: string;
    color: string;
    score: number;
    reasons: string[];
}

interface Stats {
    total_comparable_count: number;
    pre_filter_criteria: string;
}

interface Props {
    property: Property;
    similars: SimilarProperty[];
    marketAvg: MarketAverages;
    verdict: Verdict;
    stats: Stats;
}

function formatPrice(n: number | null): string {
    if (n === null) return 'N/A';
    return '€' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPricePerSqm(n: number | null): string {
    if (n === null) return 'N/A';
    return '€' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function similarityColor(score: number): string {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-500';
}

function conditionBadge(condition: string | null): { label: string; className: string } {
    switch (condition) {
        case 'new': return { label: 'New', className: 'bg-blue-100 text-blue-800' };
        case 'renovated': return { label: 'Renovated', className: 'bg-green-100 text-green-800' };
        case 'good': return { label: 'Good', className: 'bg-yellow-100 text-yellow-800' };
        case 'fair': return { label: 'Fair', className: 'bg-orange-100 text-orange-800' };
        case 'needs_work': return { label: 'Needs work', className: 'bg-red-100 text-red-800' };
        default: return { label: condition ?? 'N/A', className: 'bg-gray-100 text-gray-800' };
    }
}

function barColor(value: number, avg: number): string {
    if (value <= avg * 0.95) return 'bg-green-500';
    if (value >= avg * 1.05) return 'bg-red-500';
    return 'bg-yellow-400';
}

function barWidth(value: number, avg: number): number {
    if (avg === 0) return 0;
    return Math.min(Math.round((value / avg) * 100), 100);
}

export default function PropertyShow({ property, similars, marketAvg, verdict, stats }: Props) {
    const conditionInfo = conditionBadge(property.condition);

    const comparisons = [
        {
            label: 'Price',
            value: formatPrice(property.price),
            avg: formatPrice(marketAvg.price),
            pct: barWidth(property.price ?? 0, marketAvg.price ?? 0),
            color: barColor(property.price ?? 0, marketAvg.price ?? 0),
            detail: property.price && marketAvg.price
                ? (property.price < marketAvg.price
                    ? '✓ ' + (Math.round((1 - property.price / marketAvg.price) * 1000) / 10) + '% below market'
                    : property.price > marketAvg.price
                        ? (Math.round((property.price / marketAvg.price - 1) * 1000) / 10) + '% above market'
                        : 'At market average')
                : '',
        },
        {
            label: 'Price / m\u00B2',
            value: formatPricePerSqm(property.price_per_sqm),
            avg: formatPricePerSqm(marketAvg.price_per_sqm),
            pct: barWidth(property.price_per_sqm ?? 0, marketAvg.price_per_sqm ?? 0),
            color: barColor(property.price_per_sqm ?? 0, marketAvg.price_per_sqm ?? 0),
            detail: property.price_per_sqm && marketAvg.price_per_sqm
                ? (property.price_per_sqm < marketAvg.price_per_sqm
                    ? '✓ ' + (Math.round((1 - property.price_per_sqm / marketAvg.price_per_sqm) * 1000) / 10) + '% below market'
                    : property.price_per_sqm > marketAvg.price_per_sqm
                        ? (Math.round((property.price_per_sqm / marketAvg.price_per_sqm - 1) * 1000) / 10) + '% above market'
                        : 'At market average')
                : '',
        },
        {
            label: 'Year built',
            value: property.year_built?.toString() ?? 'N/A',
            avg: marketAvg.year_built ? Math.round(marketAvg.year_built).toString() : 'N/A',
            pct: property.year_built && marketAvg.year_built
                ? barWidth(property.year_built, marketAvg.year_built) : 0,
            color: property.year_built && marketAvg.year_built
                ? (property.year_built >= marketAvg.year_built ? 'bg-green-500' : 'bg-yellow-400')
                : 'bg-gray-200',
            detail: property.year_built && marketAvg.year_built
                ? (property.year_built > marketAvg.year_built
                    ? Math.round(property.year_built - marketAvg.year_built) + ' year(s) newer'
                    : property.year_built < marketAvg.year_built
                        ? Math.round(marketAvg.year_built - property.year_built) + ' year(s) older'
                        : 'Same year as average')
                : '',
        },
        {
            label: 'Condition',
            value: property.condition ?? 'N/A',
            avg: marketAvg.condition ?? 'N/A',
            pct: property.condition && marketAvg.condition && marketAvg.condition !== 'N/A' ? 100 : 0,
            color: property.condition && marketAvg.condition && marketAvg.condition !== 'N/A'
                ? (conditionBadge(property.condition).label === conditionBadge(marketAvg.condition).label
                    ? 'bg-yellow-400' : 'bg-green-500')
                : 'bg-gray-200',
            detail: property.condition === marketAvg.condition ? 'Same as average' : 'Differs from average',
        },
    ];

    return (
        <>
            <Head title="Property Analysis" />
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href={route('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <i className="fas fa-house-chimney text-blue-600 text-xl"></i>
                        <span className="font-bold text-xl text-gray-800">Property<span className="text-blue-600">Analyzer</span></span>
                    </Link>
                    <Link href={route('home')}>
                        <Button variant="outline" size="sm">
                            <i className="fas fa-rotate-right mr-1"></i> New Analysis
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <Card className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <i className="fas fa-map-pin"></i>
                                {[property.district, property.city].filter(Boolean).join(', ')}
                                <Badge variant="secondary" className="text-xs">
                                    {property.source_website}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-arrows-alt text-gray-400"></i> {property.sqm} m&sup2;
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-bed text-gray-400"></i> {property.bedrooms ?? 'N/A'} beds
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-bath text-gray-400"></i> {property.bathrooms ?? 'N/A'} baths
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-calendar text-gray-400"></i> {property.year_built ?? 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <i className="fas fa-check-circle text-green-500"></i> {conditionInfo.label}
                                </span>
                                {property.purpose && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        property.purpose === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                        <i className={`fas fa-${property.purpose === 'sale' ? 'tag' : 'handshake'}`}></i>
                                        For {property.purpose}
                                    </span>
                                )}
                                {property.type && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        <i className="fas fa-building"></i>
                                        {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">{formatPrice(property.price)}</div>
                            <div className="text-sm text-gray-500">{formatPricePerSqm(property.price_per_sqm)} / m&sup2;</div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Similarity threshold:</span>
                            <Badge variant="secondary" className="text-xs font-medium">{stats.pre_filter_criteria}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Comparables found:</span>
                            <span className="font-semibold text-gray-900">{stats.total_comparable_count} properties</span>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-chart-bar text-blue-600"></i> Market Comparison
                        </h2>
                        <div className="space-y-3">
                            {comparisons.map((comp) => (
                                <div key={comp.label}>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{comp.label}</span>
                                        <span className="font-medium">
                                            {comp.value} <span className="text-gray-400">vs</span> {comp.avg} avg
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                                        <div className={`${comp.color} h-2 rounded-full`} style={{ width: comp.pct + '%' }}></div>
                                    </div>
                                    {comp.detail && (
                                        <div className={`text-xs mt-0.5 flex justify-end ${comp.detail.startsWith('✓') ? 'text-green-600' : comp.detail.includes('above') ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {comp.detail}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="fas fa-gavel text-blue-600"></i> Verdict
                        </h2>
                        <div className="text-center py-4">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl mb-3 ${
                                verdict.color === 'green' ? 'bg-green-100 text-green-600' :
                                verdict.color === 'amber' ? 'bg-yellow-100 text-yellow-600' :
                                verdict.color === 'gray' ? 'bg-gray-100 text-gray-500' :
                                'bg-red-100 text-red-600'
                            }`}>
                                <i className={`fas fa-${verdict.color === 'green' ? 'check-circle' : verdict.color === 'gray' ? 'minus-circle' : 'circle-exclamation'}`}></i>
                            </div>
                            <div className={`text-2xl font-bold ${
                                verdict.color === 'green' ? 'text-green-700' :
                                verdict.color === 'amber' ? 'text-yellow-700' :
                                verdict.color === 'gray' ? 'text-gray-600' :
                                'text-red-700'
                            }`}>
                                {verdict.label}
                            </div>
                            {verdict.color !== 'gray' && (
                                <div className="text-sm text-gray-500">Score: {verdict.score} / 10</div>
                            )}
                        </div>
                        <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                            {verdict.reasons.map((reason, i) => (
                                <div key={i} className={`flex items-start gap-2 ${
                                    verdict.color === 'gray' ? 'text-gray-600' :
                                    reason.includes('below') || reason.includes('Better') || (reason.includes('average') && !reason.includes('above') && !reason.includes('older') && !reason.includes('Worse'))
                                        ? 'text-green-700' : 'text-yellow-600'
                                }`}>
                                    <i className={`fas fa-${verdict.color === 'gray' ? 'info-circle' : reason.includes('below') || reason.includes('Better') || (reason.includes('average') && !reason.includes('above') && !reason.includes('older') && !reason.includes('Worse')) ? 'check-circle' : 'circle-exclamation'} mt-0.5`}></i>
                                    <span>{reason}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="p-6 overflow-x-auto">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-arrows-left-right text-blue-600"></i> Top {Math.min(similars.length, 5)} Most Similar Properties
                        <span className="ml-2 text-xs font-normal text-gray-500">Sorted by similarity score</span>
                    </h2>
                    {similars.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <i className="fas fa-search text-3xl mb-2"></i>
                            <p>No similar properties found. Expand your search criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="py-2 px-3">#</th>
                                    <th className="py-2 px-3">Price</th>
                                    <th className="py-2 px-3">Price/m&sup2;</th>
                                    <th className="py-2 px-3">Size</th>
                                    <th className="py-2 px-3">Year</th>
                                    <th className="py-2 px-3">Condition</th>
                                    <th className="py-2 px-3 text-right">Similarity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {similars.map((s, i) => {
                                    const sc = conditionBadge(s.condition);
                                    return (
                                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-3 font-medium text-gray-900">{i + 1}</td>
                                            <td className="py-3 px-3 font-medium">{formatPrice(s.price)}</td>
                                            <td className="py-3 px-3 text-gray-600">{formatPricePerSqm(s.price_per_sqm)}</td>
                                            <td className="py-3 px-3 text-gray-600">{s.sqm} m&sup2;</td>
                                            <td className="py-3 px-3 text-gray-600">{s.year_built ?? 'N/A'}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${sc.className}`}>{sc.label}</span>
                                            </td>
                                            <td className={`py-3 px-3 text-right font-medium ${similarityColor(s.similarity_score)}`}>
                                                {s.similarity_score}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {similars.length > 5 && (
                        <div className="mt-4 text-xs text-gray-400 flex justify-between items-center border-t border-gray-100 pt-3">
                            <span>Showing {Math.min(similars.length, 5)} of {stats.total_comparable_count} similar properties</span>
                        </div>
                    )}
                </Card>

                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-robot text-sm"></i>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">AI Reasoning</div>
                            <div className="text-gray-700 text-sm mt-1 leading-relaxed">
                                This property is a <strong>{verdict.label.toLowerCase()}</strong>{' '}
                                primarily because it's{' '}
                                {verdict.reasons.length > 0 ? verdict.reasons[0] : 'based on market comparisons'}.
                                {property.price_per_sqm && marketAvg.price_per_sqm && property.price_per_sqm < marketAvg.price_per_sqm
                                    ? ` The price per square meter is attractive compared to similar properties in the area.`
                                    : ''}
                                {property.condition && marketAvg.condition && property.condition !== marketAvg.condition
                                    ? ` The condition differs from the average comparable property.`
                                    : ''}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">Powered by AI · Confidence: High</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 text-white">
                        <i className="fas fa-download mr-1"></i> Download Report
                    </Button>
                    <Button variant="outline">
                        <i className="fas fa-share-nodes mr-1"></i> Share Analysis
                    </Button>
                    <Button variant="outline">
                        <i className="fas fa-flag mr-1"></i> Report Inaccuracy
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400 border-t border-gray-200 mt-4">
                PropertyAnalyzer &copy; 2026 &mdash; Data from Cyprus real estate sites. Not financial advice.
            </div>
        </>
    );
}
