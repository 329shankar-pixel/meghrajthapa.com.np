import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { index, update } from '@/actions/App/Http/Controllers/PartyMemberTypeController';
import { ArrowLeft } from 'lucide-react';

interface PartyMemberType {
  id: number;
  name: string;
  description: string | null;
}

interface Props {
  partyMemberType: PartyMemberType;
}

import { usePermission } from '@/hooks/usePermission';
// ... other imports

export default function Edit({ partyMemberType }: Props) {
  const canView = usePermission('view-member-types');
  const backHref = canView ? index().url : '/dashboard';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Member Types', href: '/party-member-types' },
    { title: 'Edit', href: `/party-member-types/${partyMemberType.id}/edit` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${partyMemberType.name}`} />

      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <Link href={backHref}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {canView ? 'Back to List' : 'Back to Dashboard'}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Edit Member Type</h1>
          <p className="text-muted-foreground mt-1">Update details for "{partyMemberType.name}"</p>
        </div>

        <Form {...update.form(partyMemberType.id)} className="space-y-6">
          {({ errors, processing }) => (
            <>
              <div className="rounded-lg border bg-card p-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Type Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      defaultValue={partyMemberType.name}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={partyMemberType.description || ''}
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href={backHref}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppLayout>
  );
}
