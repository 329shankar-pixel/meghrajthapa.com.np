import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { update, destroyPhoto } from '@/actions/App/Http/Controllers/ActivityController';
import { router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, Image as ImageIcon, X, Trash2, MapPin, Calendar, Upload } from 'lucide-react';
import { useState } from 'react';

interface Photo {
  id: number;
  photo_path: string;
}

interface Activity {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  date: string | null;
  location: string | null;
  cover_image: string | null;
  photos: Photo[];
}

interface Props {
  activity: Activity;
}

const breadcrumbs = (id: number): BreadcrumbItem[] => [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Activities', href: '/activities' },
  { title: 'Edit', href: `/activities/${id}/edit` },
];

import { usePermission } from '@/hooks/usePermission';

export default function Edit({ activity }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const canView = usePermission('view-activities');
  const backHref = canView ? '/activities' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    title: activity.title,
    slug: activity.slug,
    description: activity.description || '',
    date: activity.date || '',
    location: activity.location || '',
    cover_image: null as File | null,
    imagePreview: activity.cover_image ? `/storage/${activity.cover_image}` : null,
    photos: [] as File[],
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData('cover_image', file);
      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setData(prev => ({ ...prev, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setData('photos', [...data.photos, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeNewPhoto = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos.splice(index, 1);
    setData('photos', newPhotos);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const deleteExistingPhoto = (photoId: number) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      router.delete(destroyPhoto.url(photoId), {
        preserveScroll: true,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use POST with _method: 'PUT' for file uploads in Laravel
    // Use POST with _method: 'PUT' for file uploads in Laravel
    post(update.url(activity.id), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs(activity.id)}>
      <Head title={`Edit Activity: ${activity.title}`} />

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Activity</h1>
              <p className="text-muted-foreground">Update activity details and manage photos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Update Activity
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
                <CardDescription>Update the title and description.</CardDescription>
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
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder="activity-url-slug"
                  />
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

            {activity.photos && activity.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Existing Photos</CardTitle>
                  <CardDescription>Photos currently associated with this activity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activity.photos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                        <img
                          src={`/storage/${photo.photo_path}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => deleteExistingPhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Photos</CardTitle>
                <CardDescription>Upload more photos to this activity.</CardDescription>
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
                          onClick={() => removeNewPhoto(index)}
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
