import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';
import { store } from '@/actions/App/Http/Controllers/LeaderController';
import { FormEventHandler } from 'react';
import { Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Leader', href: '#' },
  { title: 'Create Profile', href: '#' },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    phone: '',
    image: null as File | null,
    bio: '',
    social_links: {
      facebook: '',
      twitter: '',
      instagram: '',
      whatsapp: '',
      viber: '',
      youtube: '',
      website: '',
    },
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(store.url(), {
      forceFormData: true,
    });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setData('social_links', {
      ...data.social_links,
      [platform]: value,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Leader Profile" />

      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create Leader Profile</h1>
          <p className="text-muted-foreground mt-1">
            Initialize the political leader profile with basic info and biography.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Leader Name"
                  />
                  <InputError message={errors.name} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Email Address"
                  />
                  <InputError message={errors.email} />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Phone Number"
                  />
                  <InputError message={errors.phone} />
                </div>
              </div>

              <div className="grid w-full items-center gap-1.5 pt-4">
                <Label htmlFor="image">Profile Photo</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
                <InputError message={errors.image} />
              </div>

              <div className="grid w-full gap-1.5 pt-4">
                <Label>Biography</Label>
                <RichEditor
                  value={data.bio}
                  onChange={(val) => setData('bio', val)}
                  placeholder="Enter biography..."
                />
                <InputError message={errors.bio} />
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t">
              <h3 className="mb-4 text-lg font-medium">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(data.social_links).map((platform) => (
                  <div key={platform} className="grid gap-1.5">
                    <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    <Input
                      id={platform}
                      value={data.social_links[platform as keyof typeof data.social_links]}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                      placeholder={`${platform} URL...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Profile
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
