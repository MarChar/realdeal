import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type OutgoingNotification } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Notifications', href: '/admin/notifications' },
    { title: 'Detail', href: '#' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function NotificationsShow() {
    const { notification, success } = usePage<{ notification: OutgoingNotification; success?: string }>().props;
    const n = notification;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Detail" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 max-w-2xl">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Notification Detail</h2>
                    <Button variant="outline" onClick={() => router.visit(route('admin.notifications'))}>
                        Back
                    </Button>
                </div>

                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                        {success}
                    </div>
                )}

                <div className="rounded-xl border p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">User</span>
                            <p className="text-sm">{n.user?.name ?? `User #${n.user_id}`}</p>
                            <p className="text-xs text-muted-foreground">{n.user?.email}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">Status</span>
                            <p>
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[n.status]}`}>
                                    {n.status}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">Type</span>
                            <Badge variant="outline" className="mt-1">{n.type}</Badge>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">Channel</span>
                            <p className="text-sm">{n.channel}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">Created</span>
                            <p className="text-sm">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground">Sent At</span>
                            <p className="text-sm">{n.sent_at ? new Date(n.sent_at).toLocaleString() : '-'}</p>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-muted-foreground">Subject</span>
                        <p className="text-sm mt-1">{n.subject}</p>
                    </div>

                    <div>
                        <span className="text-xs font-medium text-muted-foreground">Body</span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{n.body}</p>
                    </div>

                    {n.error_message && (
                        <div>
                            <span className="text-xs font-medium text-red-500">Error</span>
                            <p className="text-sm mt-1 text-red-600 dark:text-red-400">{n.error_message}</p>
                        </div>
                    )}

                    {n.status === 'failed' && (
                        <Button
                            onClick={() => router.post(route('admin.notifications.resend', n.id))}
                            className="w-full"
                        >
                            Resend Notification
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
