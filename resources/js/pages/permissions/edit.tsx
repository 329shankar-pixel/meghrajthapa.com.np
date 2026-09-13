import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';
import { update } from '@/actions/App/Http/Controllers/PermissionController';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Props {
  permission: Permission;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Permissions', href: '/permissions' },
  { title: 'Edit', href: '' },
];

export default function Edit({ permission }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: permission.name,
    description: permission.description || '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(update.url(permission.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Permission - ${permission.name}`} />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Edit Permission</h1>
          <p className="text-muted-foreground text-sm">Update permission details.</p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder="e.g. create-posts"
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                placeholder="Describe what this permission allows..."
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
