import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { create, edit, destroy } from '@/actions/App/Http/Controllers/UserController';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

interface Props {
  users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
];

export default function Index({ users }: Props) {
  const selection = useListSelection(users.map((user) => user.id));

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage users and their role assignments.
            </p>
          </div>
          <Link href={create.url()}>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-3 pb-0">
            <ListSelectionToolbar
              selectedCount={selection.selectedCount}
              totalCount={users.length}
              allSelected={selection.allSelected}
              onToggleAll={selection.toggleAll}
              onClear={selection.clearSelection}
              label="users"
            />
          </div>
          <table className="w-full">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="w-12 p-4"></th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Roles</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <Checkbox checked={selection.selected.includes(user.id)} onCheckedChange={(checked) => selection.toggleOne(user.id, checked)} />
                  </td>
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span key={role.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {role.name}
                        </span>
                      ))}
                      {user.roles.length === 0 && (
                        <span className="text-muted-foreground text-xs">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={edit.url(user.id)}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
