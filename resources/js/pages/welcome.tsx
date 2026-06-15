import { Head, Link, usePage, router } from '@inertiajs/react';
import { type SharedData, type SearchResultsData } from '@/types';
import { FormEventHandler, useState, useCallback } from 'react';
import UrlTab from '@/components/tabs/UrlTab';
import TextTab from '@/components/tabs/TextTab';
import RecentSearches from '@/components/tabs/RecentSearches';

type Tab = 'url' | 'text';

interface ContentSettings {
    content_tab_ai_search_label?: string;
    content_tab_url_label?: string;
    content_homepage_tagline?: string;
    content_tab_url_description?: string;
    content_tab_url_placeholder?: string;
    content_button_compare?: string;
    content_tab_ai_search_description?: string;
    content_tab_ai_search_placeholder?: string;
    content_button_search?: string;
}

const defaultTabs: { key: Tab; label: string }[] = [
    { key: 'text', label: 'Fill me from admin/settings page' },
    { key: 'url', label: 'Fill me from admin/settings page' },
];

export default function Welcome() {
    const { auth, error: flashError, searchResults, content } = usePage<SharedData & {
        error?: string | null;
        searchResults?: SearchResultsData | null;
        content?: ContentSettings;
    }>().props;

    const [activeTab, setActiveTab] = useState<Tab>('text');
    const [url, setUrl] = useState('');
    const [textInput, setTextInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [restoredResults, setRestoredResults] = useState<SearchResultsData | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const contentSettings = (content ?? {}) as ContentSettings;

    const tabs: { key: Tab; label: string }[] = [
        { key: 'text', label: contentSettings.content_tab_ai_search_label || defaultTabs[0].label },
        { key: 'url', label: contentSettings.content_tab_url_label || defaultTabs[1].label },
    ];

    const tagline = contentSettings.content_homepage_tagline || "Fill me from admin/settings page";

    const displayedResults = restoredResults ?? searchResults ?? null;

    const handleCompare: FormEventHandler = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        router.post('/compare', { url: url.trim() });
    };

    const handleTextSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        setProcessing(true);
        setRestoredResults(null);
        router.post('/search', { text: textInput.trim() }, {
            onFinish: () => {
                setProcessing(false);
                setRefreshKey((k) => k + 1);
            },
        });
    };

    const handleRecentSearch = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/recent-searches/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setRestoredResults(data);
            setActiveTab('text');
        } catch {
            // ignore
        }
    }, []);

    return (
        <>
            <Head title="Property Analyzer">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href={route('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <i className="fas fa-house-chimney text-blue-600 text-xl"></i>
                        <span className="font-bold text-xl text-gray-800 dark:text-[#EDEDEC]">Property<span className="text-blue-600">Analyzer</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={auth.user.role === 'admin' ? route('admin.dashboard') : route('dashboard')}
                                className="text-sm text-gray-600 hover:text-blue-600 dark:text-[#A1A09A] dark:hover:text-blue-400"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-[#A1A09A] dark:hover:text-blue-400"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-[#A1A09A] dark:hover:text-blue-400"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="flex min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <RecentSearches onSelect={handleRecentSearch} refreshKey={refreshKey} />

                <div className="flex-1 flex flex-col items-center pt-12 px-6 lg:px-8">
                    <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
                        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
                            Property Analyzer
                        </h1>
                        <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                            {tagline}
                        </p>

                        <div className="w-full">
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6" role="tablist">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                                            activeTab === tab.key
                                                ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'url' && (
                                <UrlTab
                                    url={url}
                                    onUrlChange={setUrl}
                                    onSubmit={handleCompare}
                                    content={contentSettings}
                                />
                            )}

                            {activeTab === 'text' && (
                                <TextTab
                                    value={textInput}
                                    onValueChange={setTextInput}
                                    onSubmit={handleTextSubmit}
                                    searchResults={displayedResults}
                                    processing={processing}
                                    content={contentSettings}
                                />
                            )}
                        </div>

                        {flashError && (
                            <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                                {flashError}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
