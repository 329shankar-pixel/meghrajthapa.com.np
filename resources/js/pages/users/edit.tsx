import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler } from 'react';
import { update, index } from '@/actions/App/Http/Controllers/UserController';
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

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

interface Props {
  user: User;
  roles: Role[];
}

export default function Edit({ user, roles }: Props) {
  const canView = usePermission('view-access-control');
  const backHref = canView ? '/users' : '/dashboard';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
    { title: user.name, href: `/users/${user.id}/edit` },
  ];

  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    roles: user.roles.map(r => r.id),
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(update.url(user.id));
  };

  const handleRoleChange = (roleId: string) => {
    setData('roles', [parseInt(roleId)]);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${user.name}`} />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
          <p className="text-muted-foreground text-sm">Update user details and role assignment.</p>
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
                <Label htmlFor="password">
                  New Password <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  placeholder="Min 8 characters"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={e => setData('password_confirmation', e.target.value)}
                  placeholder="Repeat new password"
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
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={backHref}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
