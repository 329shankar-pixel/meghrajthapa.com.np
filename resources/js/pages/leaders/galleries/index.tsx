import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Images, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { edit as editGallery, create as createGallery, destroy as destroyGallery } from '@/actions/App/Http/Controllers/LeaderGalleryController';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { useState, FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { store as storeCategory, destroy as destroyCategory } from '@/actions/App/Http/Controllers/LeaderCategoryController';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Category {
  id: number;
  name: string;
}

interface Photo {
  id: number;
  photo_path: string;
}

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  category: Category | null;
  cover_image: string | null;
  photos: Photo[];
  created_at: string;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  galleries: Gallery[];
  categories: Category[];
}

export default function GalleriesIndex({ leader, galleries, categories }: Props) {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const selection = useListSelection(galleries.map((gallery) => gallery.id));

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Galleries', href: '#' },
  ];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this gallery? This action will remove all associated photos.')) {
      router.delete(destroyGallery.url(id));
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      router.delete(destroyCategory.url(id));
    }
  }

  const categoryForm = useForm({
    name: '',
  });

  const submitCategory: FormEventHandler = (e) => {
    e.preventDefault();
    categoryForm.post(storeCategory.url(), {
      onSuccess: () => {
        categoryForm.reset();
        setIsCategoryDialogOpen(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leader Galleries" />

      <div className="mx-auto max-w-7xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leader Galleries</h1>
            <p className="text-muted-foreground mt-1">
              Manage photo collections for <strong>{leader.name}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Categories
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <form onSubmit={submitCategory} className="flex gap-2 items-end">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="category_name">New Category Name</Label>
                      <Input
                        id="category_name"
                        value={categoryForm.data.name}
                        onChange={(e) => categoryForm.setData('name', e.target.value)}
                        placeholder="e.g., Events, Trips"
                      />
                      <InputError message={categoryForm.errors.name} />
                    </div>
                    <Button type="submit" disabled={categoryForm.processing}>Add</Button>
                  </form>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-none">Existing Categories</h4>
                    <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No categories yet.</div>
                      ) : (
                        categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between p-2 text-sm">
                            <span>{cat.name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCategory(cat.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link href={createGallery.url()}>
                <Plus className="mr-2 h-4 w-4" />
                New Gallery
              </Link>
            </Button>
          </div>
        </div>

        <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={galleries.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="galleries" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed bg-card/50 p-16 text-center">
              <Images className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No galleries created yet.</p>
              <p className="text-muted-foreground mt-1">Create your first gallery to showcase photos.</p>
            </div>
          ) : (
            galleries.map((gallery) => (
              <div key={gallery.id} className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                <div className="absolute left-3 top-3 z-20 rounded-md bg-background/90 p-1 shadow-sm">
                  <Checkbox checked={selection.selected.includes(gallery.id)} onCheckedChange={(checked) => selection.toggleOne(gallery.id, checked)} />
                </div>
                <div className="aspect-[3/2] w-full overflow-hidden bg-muted relative">
                  {gallery.cover_image ? (
                    <img src={`/storage/${gallery.cover_image}`} alt={gallery.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-10 w-10 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {gallery.category && (
                      <Badge variant="secondary" className="backdrop-blur-md bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70">
                        {gallery.category.name}
                      </Badge>
                    )}
                    <Badge variant="default" className="backdrop-blur-md">
                      {gallery.photos.length} Photos
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold line-clamp-1 leading-snug mb-1">{gallery.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {gallery.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={editGallery.url(gallery.id)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(gallery.id)}>
                      <Trash2 className="h-4 w-4" />
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
