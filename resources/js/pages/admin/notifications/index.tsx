import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type OutgoingNotification } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Notifications', href: '/admin/notifications' },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

interface PaginatedData {
    data: OutgoingNotification[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function NotificationsIndex() {
    const { notifications } = usePage<{ notifications: PaginatedData }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <h2 className="text-lg font-semibold">Notifications</h2>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">User</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-left font-medium">Channel</th>
                                <th className="px-4 py-3 text-left font-medium">Subject</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Sent At</th>
                                <th className="px-4 py-3 text-left font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {notifications.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No notifications yet.
                                    </td>
                                </tr>
                            ) : (
                                notifications.data.map((n) => (
                                    <tr key={n.id} className="hover:bg-accent/50">
                                        <td className="px-4 py-3">{n.user?.name ?? `User #${n.user_id}`}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{n.type}</Badge>
                                        </td>
                                        <td className="px-4 py-3">{n.channel}</td>
                                        <td className="max-w-xs truncate px-4 py-3">{n.subject}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[n.status]}`}>
                                                {n.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {n.sent_at ? new Date(n.sent_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={route('admin.notifications.show', n.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {notifications.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
