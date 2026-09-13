import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';
import { store } from '@/actions/App/Http/Controllers/PermissionController';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Permissions', href: '/permissions' },
  { title: 'Create', href: '/permissions/create' },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(store.url());
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Permission" />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create New Permission</h1>
          <p className="text-muted-foreground text-sm">Define a new system permission.</p>
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
                {processing ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
