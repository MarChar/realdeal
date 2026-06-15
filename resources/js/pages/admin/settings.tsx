import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

type Tab = 'api' | 'content' | 'notifications';

const apiFields = [
    { key: 'firecrawl_api_key', label: 'Firecrawl API Key', type: 'password', placeholder: 'fc-...' },
    { key: 'gemini_api_key', label: 'Gemini API Key', type: 'password', placeholder: 'AIza...' },
    { key: 'groq_api_key', label: 'Groq API Key', type: 'password', placeholder: 'gsk_...' },
];

const contentFields = [
    { key: 'content_tab_ai_search_label', label: 'AI Search Tab Label', type: 'text' },
    { key: 'content_tab_url_label', label: 'URL Tab Label', type: 'text' },
    { key: 'content_homepage_tagline', label: 'Homepage Tagline', type: 'textarea' },
    { key: 'content_tab_ai_search_description', label: 'AI Search Tab Description', type: 'textarea' },
    { key: 'content_tab_ai_search_placeholder', label: 'AI Search Textarea Placeholder', type: 'textarea' },
    { key: 'content_button_search', label: 'Search Button Text', type: 'text' },
    { key: 'content_tab_url_description', label: 'URL Tab Description', type: 'textarea' },
    { key: 'content_tab_url_placeholder', label: 'URL Input Placeholder', type: 'text' },
    { key: 'content_button_compare', label: 'Compare Button Text', type: 'text' },
];

const notificationFields = [
    { key: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com' },
    { key: 'smtp_port', label: 'SMTP Port', type: 'text', placeholder: '587' },
    { key: 'smtp_username', label: 'SMTP Username', type: 'text' },
    { key: 'smtp_password', label: 'SMTP Password', type: 'password' },
    { key: 'smtp_encryption', label: 'SMTP Encryption', type: 'text', placeholder: 'tls' },
    { key: 'smtp_from_address', label: 'From Address', type: 'text', placeholder: 'noreply@example.com' },
    { key: 'smtp_from_name', label: 'From Name', type: 'text', placeholder: 'RealDeal' },
    { key: 'twilio_sid', label: 'Twilio SID', type: 'password' },
    { key: 'twilio_auth_token', label: 'Twilio Auth Token', type: 'password' },
    { key: 'twilio_from_number', label: 'Twilio From Number', type: 'text', placeholder: '+1234567890' },
];

const defaultContent: Record<string, string> = {
    content_tab_ai_search_label: 'Fill me from admin/settings page',
    content_tab_url_label: 'Fill me from admin/settings page',
    content_homepage_tagline: 'Fill me from admin/settings page',
    content_tab_ai_search_description: 'Fill me from admin/settings page',
    content_tab_ai_search_placeholder: 'Fill me from admin/settings page',
    content_button_search: 'Fill me from admin/settings page',
    content_tab_url_description: 'Fill me from admin/settings page',
    content_tab_url_placeholder: 'Fill me from admin/settings page',
    content_button_compare: 'Fill me from admin/settings page',
};

export default function AdminSettings() {
    const { settings, success } = usePage<{ settings: Record<string, string>; success?: string }>().props;
    const [activeTab, setActiveTab] = useState<Tab>('api');
    const [processing, setProcessing] = useState(false);

    const [form, setForm] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        for (const field of [...apiFields, ...contentFields, ...notificationFields]) {
            initial[field.key] = settings[field.key] || defaultContent[field.key] || '';
        }
        return initial;
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(route('admin.settings.update'), { settings: form }, {
            onFinish: () => setProcessing(false),
        });
    };

const tabs: { key: Tab; label: string }[] = [
    { key: 'api', label: 'API Keys' },
    { key: 'content', label: 'Content' },
    { key: 'notifications', label: 'Notifications' },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-2xl">
                <h2 className="text-lg font-semibold">Settings</h2>

                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                        {success}
                    </div>
                )}

                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1" role="tablist">
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {activeTab === 'api' && (
                        <div className="flex flex-col gap-6">
                            {apiFields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-sm font-medium">{field.label}</label>
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        className="w-full h-12 rounded-md border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="flex flex-col gap-6">
                            <p className="text-sm text-muted-foreground">Configure SMTP for email sending and Twilio for SMS notifications.</p>
                            {notificationFields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-sm font-medium">{field.label}</label>
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder ?? ''}
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        className="w-full h-12 rounded-md border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="flex flex-col gap-6">
                            {contentFields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-sm font-medium">{field.label}</label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    ) : (
                                        <input
                                            type="text"
                                            value={form[field.key] || ''}
                                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                            className="w-full h-12 rounded-md border border-input bg-background px-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" className="h-12 px-8 text-base" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
