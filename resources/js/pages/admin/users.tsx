import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
];

interface UsersPageProps {
    users: User[];
}

export default function AdminUsers({ users }: UsersPageProps) {
    const handleDelete = (user: User) => {
        if (confirm(`Delete user "${user.name}"?`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All Users</h2>
                    <Button asChild>
                        <Link href={route('admin.users.create')}>Add New</Link>
                    </Button>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Joined</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-sidebar-border/70 last:border-0 dark:border-sidebar-border">
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#706f6c] dark:text-[#A1A09A]">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.users.show', user.id)}>View</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('admin.users.edit', user.id)}>Edit</Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
