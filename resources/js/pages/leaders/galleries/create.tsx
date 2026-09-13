import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store as storeGallery } from '@/actions/App/Http/Controllers/LeaderGalleryController';
import { FormEventHandler } from 'react';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import InputError from '@/components/input-error';

interface Category {
  id: number;
  name: string;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  categories: Category[];
}

export default function GalleryCreate({ leader, categories }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Galleries', href: '/leader/galleries' },
    { title: 'Create', href: '#' },
  ];

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    leader_category_id: '',
    description: '',
    cover_image: null as File | null,
    photos: [] as File[],
    coverPreview: null as string | null,
    photoPreviews: [] as string[],
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData((oldData) => ({
      ...oldData,
      cover_image: file,
      coverPreview: file ? URL.createObjectURL(file) : null
    }));
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setData((oldData) => ({
        ...oldData,
        photos: [...oldData.photos, ...files],
        photoPreviews: [...oldData.photoPreviews, ...newPreviews]
      }));
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);

    const newPreviews = [...data.photoPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);

    setData((oldData) => ({
      ...oldData,
      photos: newPhotos,
      photoPreviews: newPreviews
    }));
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(storeGallery.url(), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Gallery" />

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Gallery</h1>
            <p className="text-muted-foreground mt-1">
              Add a new photo collection for <strong>{leader.name}</strong>
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href={'/leader/galleries'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Galleries
            </Link>
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-8">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              There were errors with your submission. Please check the fields below.
              {errors.photos && <p className="mt-1 font-bold">• {errors.photos}</p>}
            </div>
          )}

          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="title">Gallery Title</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Enter gallery title"
                />
                <InputError message={errors.title} />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={data.leader_category_id}
                  onValueChange={(val) => setData('leader_category_id', val)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.leader_category_id} />
              </div>
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Describe this gallery..."
                className="min-h-[100px]"
              />
              <InputError message={errors.description} />
            </div>

            <div className="grid w-full gap-1.5">
              <Label htmlFor="cover_image">Cover Image</Label>
              {data.coverPreview && (
                <div className="mb-2 w-32 aspect-[3/2] rounded-md overflow-hidden border">
                  <img src={data.coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Input
                id="cover_image"
                type="file"
                onChange={handleCoverChange}
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">Main image representing the gallery.</p>
              <InputError message={errors.cover_image} />
            </div>

            <div className="grid w-full gap-1.5 border-t pt-6">
              <Label htmlFor="photos" className="font-semibold text-lg mb-2">Upload Photos</Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="photos" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> multiple photos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (MAX. 2MB each)</p>
                  </div>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handlePhotosChange}
                    accept="image/*"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tip: If you are uploading many photos, try uploading them in smaller batches (5-10 at a time) to ensure success.
              </p>

              {data.photoPreviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Selected Photos ({data.photos.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {data.photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group/item">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <InputError message={errors.photos as string} />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href={'/leader/galleries'}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Gallery
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
