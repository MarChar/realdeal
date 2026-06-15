import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData, type InAppNotification } from '@/types';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

export function NotificationBell() {
    const { notifications, unread_notifications_count } = usePage<SharedData>().props;

    const list = (notifications as InAppNotification[]) || [];
    const unread = (unread_notifications_count as number) || 0;

    const markAsRead = (id: string) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unread > 0 && (
                        <span className="text-xs text-muted-foreground">{unread} unread</span>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {list.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        list.map((n) => (
                            <Link
                                key={n.id}
                                href={n.action_url || '#'}
                                onClick={() => !n.read_at && markAsRead(n.id)}
                                className={cn(
                                    'flex flex-col gap-1 border-b px-4 py-3 text-sm transition-colors hover:bg-accent last:border-b-0',
                                    !n.read_at && 'bg-accent/50',
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className={cn('font-medium', !n.read_at && 'text-foreground')}>
                                        {n.title}
                                    </span>
                                    {!n.read_at && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <span className="line-clamp-2 text-muted-foreground">{n.body}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(n.created_at).toLocaleDateString()}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
                <div className="border-t px-4 py-2">
                    <Link
                        href={route('admin.notifications')}
                        className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View all notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
