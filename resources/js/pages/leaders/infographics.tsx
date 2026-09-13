import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState } from 'react';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { store as storeInfographic, destroy as destroyInfographic } from '@/actions/App/Http/Controllers/InfographicController';

interface Infographic {
  id: number;
  title: string;
  description: string | null;
  photo: string;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  infographics: Infographic[];
}

export default function Infographics({ leader, infographics }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Infographics', href: '#' },
  ];

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    photo: null as File | null,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(storeInfographic.url(), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this infographic?')) {
      router.delete(destroyInfographic.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leader Infographics" />

      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leader Infographics</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage infographics for <strong>{leader.name}</strong>
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Infographic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Infographic</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Enter infographic title"
                  />
                  <InputError message={errors.title} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Briefly describe this infographic"
                    rows={3}
                  />
                  <InputError message={errors.description} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photo">Infographic Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                    accept="image/*"
                  />
                  <InputError message={errors.photo} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Uploading...' : 'Add Infographic'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {infographics.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed bg-card/50 p-16 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No infographics added yet.</p>
              <p className="text-muted-foreground mt-1">Start by adding your first leader infographic.</p>
            </div>
          ) : (
            infographics.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={`/storage/${item.photo}`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold line-clamp-1 mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-end border-t pt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
