import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';
import { store, index } from '@/actions/App/Http/Controllers/UserController';
import { usePermission } from '@/hooks/usePermission';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Props {
  roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Users', href: '/users' },
  { title: 'Create', href: '/users/create' },
];

export default function Create({ roles }: Props) {
  const canView = usePermission('view-access-control');
  const backHref = canView ? '/users' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] as number[], // Keep as array for backend compatibility
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(store.url());
  };

  const handleRoleChange = (roleId: string) => {
    setData('roles', [parseInt(roleId)]);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create New User</h1>
          <p className="text-muted-foreground text-sm">Add a new user and assign a role.</p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  placeholder="user@example.com"
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="role-select">Assign Role</Label>
              <Select
                onValueChange={handleRoleChange}
                value={data.roles[0]?.toString() || ""}
              >
                <SelectTrigger id="role-select" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-xs text-muted-foreground">{role.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roles && <p className="text-sm text-destructive">{errors.roles}</p>}

              {roles.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No roles available. Please create roles first.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={backHref}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
