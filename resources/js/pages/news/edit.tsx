import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichEditor } from '@/components/rich-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { update } from '@/actions/App/Http/Controllers/NewsController';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface News {
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  is_published: boolean;
  published_at: string | null;
}

interface Props {
  news: News;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'News', href: '/news' },
  { title: 'Edit', href: '/news/edit' },
];

import { usePermission } from '@/hooks/usePermission';

export default function Edit({ news }: Props) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!news.slug);
  const canView = usePermission('view-news');
  const backHref = canView ? '/news' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    title: news.title || '',
    slug: news.slug || '',
    content: news.content || '',
    featured_image: null as File | null,
    meta_title: news.meta_title || '',
    meta_description: news.meta_description || '',
    meta_keywords: news.meta_keywords || '',
    is_published: !!news.is_published,
    published_at: news.published_at ? news.published_at.substring(0, 16) : '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We use post with _method PUT because of multipart/form-data limitations with PUT/PATCH in PHP/Laravel
    post(update.url(news.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit News: ${news.title}`} />

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit News</h1>
              <p className="text-muted-foreground text-sm">Update article details and settings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Enter news title"
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
                    placeholder="news-url-slug"
                  />
                  <InputError message={errors.slug} />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichEditor
                    value={data.content}
                    onChange={val => setData('content', val)}
                    placeholder="Start writing your news article..."
                  />
                  <InputError message={errors.content} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={data.meta_title}
                    onChange={e => setData('meta_title', e.target.value)}
                    placeholder="Enter meta title for SEO"
                  />
                  <InputError message={errors.meta_title} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={data.meta_description}
                    onChange={e => setData('meta_description', e.target.value)}
                    placeholder="Enter meta description"
                  />
                  <InputError message={errors.meta_description} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_keywords">Meta Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={data.meta_keywords}
                    onChange={e => setData('meta_keywords', e.target.value)}
                    placeholder="Enter keywords separated by commas"
                  />
                  <InputError message={errors.meta_keywords} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_published"
                    checked={data.is_published}
                    onCheckedChange={(checked) => setData('is_published', !!checked)}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
                <InputError message={errors.is_published} />

                <div className="space-y-2">
                  <Label htmlFor="published_at">Publish Date (Optional)</Label>
                  <Input
                    id="published_at"
                    type="datetime-local"
                    value={data.published_at}
                    onChange={e => setData('published_at', e.target.value)}
                  />
                  <InputError message={errors.published_at} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {news.featured_image && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border mb-4">
                    <img
                      src={`/storage/${news.featured_image}`}
                      className="w-full h-full object-cover"
                      alt="Current featured"
                    />
                  </div>
                )}
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <Label className="cursor-pointer text-primary hover:underline">
                    {news.featured_image ? 'Change image' : 'Upload image'}
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => setData('featured_image', e.target.files ? e.target.files[0] : null)}
                    />
                  </Label>
                  {data.featured_image && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {data.featured_image.name}
                    </p>
                  )}
                </div>
                <InputError message={errors.featured_image} />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
