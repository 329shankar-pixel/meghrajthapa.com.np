import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';
import { updateBiography } from '@/actions/App/Http/Controllers/LeaderController';
import { FormEventHandler } from 'react';
import { Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';

interface Leader {
  id: number;
  name: string;
  bio: string | null;
}

interface Props {
  leader: Leader;
}

export default function Biography({ leader }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Biography', href: '#' },
  ];

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    bio: leader.bio || '',
    // Name is required by validation in UpdateLeaderRequest but we only want to update bio here.
    // However, the request validates name. I should probably create a separate request or just pass name.
    name: leader.name,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(updateBiography.url(), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Biography" />

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Leader Biography</h1>
          <p className="text-muted-foreground mt-1">
            Update biography for <strong>{leader.name}</strong>
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="grid w-full gap-1.5">
              <Label>Biography</Label>
              <RichEditor
                value={data.bio}
                onChange={(val) => setData('bio', val)}
                placeholder="Enter biography..."
              />
              <InputError message={errors.bio} />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Biography
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
