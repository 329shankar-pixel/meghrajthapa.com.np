import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { create, edit, destroy } from '@/actions/App/Http/Controllers/PermissionController';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Permission {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Props {
  permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Permissions', href: '/permissions' },
];

export default function Index({ permissions }: Props) {
  const selection = useListSelection(permissions.map((permission) => permission.id));

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this permission?')) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Permissions" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Permissions</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage system permissions.
            </p>
          </div>
          <Link href={create.url()}>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Create Permission
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-3 pb-0">
            <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={permissions.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="permissions" />
          </div>
          <table className="w-full">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="w-12 p-4"></th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Slug</th>
                <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <Checkbox checked={selection.selected.includes(permission.id)} onCheckedChange={(checked) => selection.toggleOne(permission.id, checked)} />
                  </td>
                  <td className="p-4 font-medium">{permission.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{permission.slug}</td>
                  <td className="p-4 text-sm text-muted-foreground">{permission.description}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={edit.url(permission.id)}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No permissions found.
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
