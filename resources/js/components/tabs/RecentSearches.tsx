import { useState, useEffect } from 'react';

interface RecentSearchItem {
    id: string;
    text: string;
    result_count: number;
    created_at: string;
}

interface RecentSearchesProps {
    onSelect: (id: string) => void;
    refreshKey: number;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function RecentSearches({ onSelect, refreshKey }: RecentSearchesProps) {
    const [searches, setSearches] = useState<RecentSearchItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/recent-searches')
            .then((r) => r.json())
            .then((data) => {
                setSearches(data.searches ?? []);
            })
            .catch(() => setSearches([]))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    if (loading && searches.length === 0) return null;

    if (searches.length === 0) return null;

    return (
        <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-64px)] overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Recent Searches
            </h3>
            <div className="flex flex-col gap-1">
                {searches.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className="text-left w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <p className="text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">
                            {s.text}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {s.result_count} results · {timeAgo(s.created_at)}
                        </p>
                    </button>
                ))}
            </div>
        </aside>
    );
}
