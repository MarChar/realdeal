import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface ShowProps {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
    { title: 'View User', href: '' },
];

export default function Show({ user }: ShowProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border max-w-lg rounded-xl border p-6">
                    <div className="mb-6 space-y-3">
                        <div>
                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Name</span>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Email</span>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Role</span>
                            <p className="font-medium capitalize">{user.role}</p>
                        </div>
                        <div>
                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Joined</span>
                            <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.users')}>Back to users</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
