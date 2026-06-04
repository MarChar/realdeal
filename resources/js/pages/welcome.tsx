import { Head, Link, usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormEventHandler, useState } from 'react';

interface Analysis {
    url: string;
    title: string;
    description: string;
    price: string;
    condition?: string;
    rating?: number;
    reason?: string;
    images?: string[];
}

export default function Welcome() {
    const { auth, analysis } = usePage<SharedData & { analysis?: Analysis | null }>().props;
    const [url, setUrl] = useState('');

    const handleAnalyze: FormEventHandler = (e) => {
        e.preventDefault();
        if (!url.trim()) return;
        router.post('/analyze', { url: url.trim() });
    };

    return (
        <>
            <Head title="Deal or No Deal">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={auth.user.role === 'admin' ? route('admin.dashboard') : route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full flex-1 items-start justify-center pt-12">
                    <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-4 text-center">
                        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
                            Deal or No Deal
                        </h1>
                        <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                            Paste a URL and analyze it instantly.
                        </p>

                        <form onSubmit={handleAnalyze} className="flex w-full gap-3">
                            <Input
                                type="url"
                                placeholder="https://www.bazaraki.com/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-14 flex-1 text-lg"
                            />
                            <Button type="submit" className="h-14 px-8 text-lg">
                                Analyze
                            </Button>
                        </form>

                        {analysis && (
                            <div className="w-full rounded-xl border border-sidebar-border/70 bg-white p-6 text-left shadow-sm dark:bg-[#161615]">
                                <div className="mb-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">Analyzed URL:</div>
                                <a href={analysis.url} target="_blank" className="mb-4 block break-all text-sm text-blue-600 underline dark:text-blue-400">
                                    {analysis.url}
                                </a>
                                {analysis.images && analysis.images.length > 0 && (
                                    <div className="mb-4">
                                        <img src={analysis.images[0]} alt={analysis.title} className="w-full max-h-96 rounded-lg border object-contain" />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Title</span>
                                        <p className="font-medium">{analysis.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Description</span>
                                        <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{analysis.description}</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div>
                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Price</span>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysis.price}</p>
                                        </div>
                                        {analysis.condition && analysis.condition !== 'N/A' && (
                                            <div>
                                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Condition</span>
                                                <p className="font-medium capitalize">{analysis.condition}</p>
                                            </div>
                                        )}
                                    </div>
                                    {analysis.rating !== null && analysis.rating !== undefined && (
                                        <div>
                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Deal Rating</span>
                                            <div className="mt-1 flex items-center gap-3">
                                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${analysis.rating}%`,
                                                            backgroundColor: analysis.rating >= 70 ? '#22c55e' : analysis.rating >= 40 ? '#eab308' : '#ef4444',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-lg font-bold" style={{
                                                    color: analysis.rating >= 70 ? '#22c55e' : analysis.rating >= 40 ? '#eab308' : '#ef4444',
                                                }}>
                                                    {analysis.rating}/100
                                                </span>
                                            </div>
                                            {analysis.reason && (
                                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{analysis.reason}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
