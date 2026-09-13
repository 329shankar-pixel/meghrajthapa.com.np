import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { create, edit, destroy } from '@/actions/App/Http/Controllers/RoleController';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Permission {
  id: number;
  name: string;
  slug: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_default: boolean;
  permissions: Permission[];
}

interface Props {
  roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Roles', href: '/roles' },
];

export default function Index({ roles }: Props) {
  const selection = useListSelection(roles.map((role) => role.id));

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Roles</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage user roles and their permissions.
            </p>
          </div>
          <Link href={create.url()}>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-3 pb-0">
            <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={roles.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="roles" />
          </div>
          <table className="w-full">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="w-12 p-4"></th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Slug</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Permissions</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <Checkbox checked={selection.selected.includes(role.id)} onCheckedChange={(checked) => selection.toggleOne(role.id, checked)} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{role.name}</span>
                      {role.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green-500/10 text-green-600 border border-green-500/20">
                          Default
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{role.slug}</td>
                  <td className="p-4 text-sm text-muted-foreground">{role.description}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {role.permissions.length} Permissions
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={edit.url(role.id)}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No roles found.
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
