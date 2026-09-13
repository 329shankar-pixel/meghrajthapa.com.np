import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormEventHandler } from 'react';
import { store } from '@/actions/App/Http/Controllers/RoleController';
import { usePermission } from '@/hooks/usePermission';

interface Permission {
  id: number;
  name: string;
  slug: string;
}

interface GroupedPermissions {
  [key: string]: Permission[];
}

interface Props {
  permissions_grouped: GroupedPermissions;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Roles', href: '/roles' },
  { title: 'Create', href: '/roles/create' },
];

export default function Create({ permissions_grouped }: Props) {
  const canView = usePermission('view-access-control');
  const backHref = canView ? '/roles' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    is_default: false,
    permissions: [] as number[],
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(store.url());
  };

  const togglePermission = (id: number) => {
    if (data.permissions.includes(id)) {
      setData('permissions', data.permissions.filter(pid => pid !== id));
    } else {
      setData('permissions', [...data.permissions, id]);
    }
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map(p => p.id);
    const allSelected = groupIds.every(id => data.permissions.includes(id));

    if (allSelected) {
      // Remove all
      setData('permissions', data.permissions.filter(id => !groupIds.includes(id)));
    } else {
      // Add missing
      const newPermissions = [...data.permissions];
      groupIds.forEach(id => {
        if (!newPermissions.includes(id)) newPermissions.push(id);
      });
      setData('permissions', newPermissions);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Role" />

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Create New Role</h1>
            <p className="text-muted-foreground">Define a new authority level and select allowed actions.</p>
          </div>
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="rounded-full">
              Back to {canView ? 'Roles' : 'Dashboard'}
            </Button>
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Role Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-muted/30">
                  <h2 className="font-semibold">Role Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      placeholder="e.g. Content Manager"
                      className="h-10"
                      required
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
                      placeholder="What can this role do?"
                      className="min-h-[100px] resize-none"
                    />
                    {errors.description && <p className="text-xs text-destructive mt-1 font-medium">{errors.description}</p>}
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_default" className="text-sm font-medium">Default Role</Label>
                      <p className="text-xs text-muted-foreground">Set as default for new users</p>
                    </div>
                    <Checkbox
                      id="is_default"
                      checked={data.is_default}
                      onCheckedChange={(checked) => setData('is_default', checked as boolean)}
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={processing} className="w-full text-md font-semibold h-11">
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating...
                    </span>
                  ) : 'Create Role'}
                </Button>
                <div className="mt-4 flex justify-center">
                  <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground underline">
                    Cancel and return to {canView ? 'Roles' : 'Dashboard'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Permissions Grouped */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-tight px-1">Section Permissions</h2>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full border">
                  {data.permissions.length} actions selected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(permissions_grouped).map(([group, groupPermissions]) => {
                  const allSelected = groupPermissions.every(p => data.permissions.includes(p.id));

                  return (
                    <div key={group} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary/30 transition-colors">
                      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <Label className="font-bold text-sm uppercase tracking-wider opacity-80">{group}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 text-[10px] font-bold ${allSelected ? 'text-primary' : 'text-muted-foreground'}`}
                          onClick={() => toggleGroup(groupPermissions)}
                        >
                          {allSelected ? 'UNSELECT ALL' : 'SELECT ALL'}
                        </Button>
                      </div>
                      <div className="p-4 space-y-3 flex-1">
                        {groupPermissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-between group">
                            <Label
                              htmlFor={`perm-${permission.id}`}
                              className="cursor-pointer text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity"
                            >
                              {permission.name.split(' ').slice(0, -1).join(' ')}
                            </Label>
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={data.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
