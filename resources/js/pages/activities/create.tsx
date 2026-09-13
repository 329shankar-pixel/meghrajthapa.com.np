import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { store } from '@/actions/App/Http/Controllers/ActivityController';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, Image as ImageIcon, X, MapPin, Calendar, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Activities', href: '/activities' },
  { title: 'Create', href: '/activities/create' },
];

import { usePermission } from '@/hooks/usePermission';

export default function Create() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const canView = usePermission('view-activities');
  const backHref = canView ? '/activities' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    slug: '',
    description: '',
    date: '',
    location: '',
    cover_image: null as File | null,
    photos: [] as File[],
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('cover_image', e.target.files[0]);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      const generatedSlug = data.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      setData('slug', generatedSlug);
    }
  }, [data.title, isSlugManuallyEdited]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setData('photos', [...data.photos, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    setData('photos', newPhotos);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(store.url(), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Activity" />

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Activity</h1>
              <p className="text-muted-foreground">Add a new activity with photos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Save Activity
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
                <CardDescription>Enter the title and description for this activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Enter activity title"
                  />
                  <InputError message={errors.title} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">Slug</Label>
                    {!isSlugManuallyEdited && (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Auto-generated</span>
                    )}
                  </div>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => {
                      setData('slug', e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="activity-url-slug"
                  />
                  <p className="text-[11px] text-muted-foreground">The unique URL identifier for this activity.</p>
                  <InputError message={errors.slug} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichEditor
                    value={data.description}
                    onChange={val => setData('description', val)}
                    placeholder="Describe the activity..."
                  />
                  <InputError message={errors.description} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>When and where this activity took place.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      value={data.date}
                      onChange={e => setData('date', e.target.value)}
                      required
                    />
                  </div>
                  <InputError message={errors.date} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="location"
                      className="pl-10"
                      value={data.location}
                      onChange={e => setData('location', e.target.value)}
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                  </div>
                  <InputError message={errors.location} />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <label htmlFor="cover_image" className="block w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    {data.cover_image ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <img
                          src={URL.createObjectURL(data.cover_image)}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white font-medium flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 py-4">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-sm font-medium">Upload Cover Image</span>
                      </div>
                    )}
                    <input
                      id="cover_image"
                      type="file"
                      className="hidden"
                      onChange={handleCoverImageChange}
                      accept="image/*"
                    />
                  </label>
                  <InputError message={errors.cover_image} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gallery Photos</CardTitle>
                <CardDescription>Upload one or more photos of the activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <Label className="cursor-pointer text-primary hover:underline">
                    Upload photos
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                    />
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Multiple files allowed (JPG, PNG, GIF)
                  </p>
                </div>
                <InputError message={errors.photos} />

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout >
  );
}
