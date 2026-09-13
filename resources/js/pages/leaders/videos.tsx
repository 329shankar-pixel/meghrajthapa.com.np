import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, useEffect } from 'react';
import { Trash2, Plus, Play, ExternalLink, Pencil } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { store as storeVideo, update as updateVideo, destroy as destroyVideo } from '@/actions/App/Http/Controllers/LeaderVideoController';

interface Video {
  id: number;
  title: string;
  youtube_url: string;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  videos: Video[];
}

export default function Videos({ leader, videos }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Videos', href: '#' },
  ];

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    title: '',
    youtube_url: '',
  });

  useEffect(() => {
    if (editingVideo) {
      setData({
        title: editingVideo.title,
        youtube_url: editingVideo.youtube_url,
      });
    } else {
      reset();
    }
    clearErrors();
  }, [editingVideo]);

  const openCreateDialog = () => {
    setEditingVideo(null);
    setIsDialogOpen(true);
  }

  const openEditDialog = (video: Video) => {
    setEditingVideo(video);
    setIsDialogOpen(true);
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if (editingVideo) {
      put(updateVideo.url(editingVideo.id), {
        onSuccess: () => {
          reset();
          setIsDialogOpen(false);
          setEditingVideo(null);
        },
      });
    } else {
      post(storeVideo.url(), {
        onSuccess: () => {
          reset();
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      router.delete(destroyVideo.url(id));
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leader Videos" />

      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leader Videos</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage video links for <strong>{leader.name}</strong>
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={openCreateDialog}>
                <Plus className="mr-2 h-5 w-5" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Enter video title"
                  />
                  <InputError message={errors.title} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={data.youtube_url}
                    onChange={(e) => setData('youtube_url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <InputError message={errors.youtube_url} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Saving...' : (editingVideo ? 'Update Video' : 'Add Video')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {videos.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed bg-card/50 p-16 text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No videos added yet.</p>
              <p className="text-muted-foreground mt-1">Add YouTube links to showcase leader's videos.</p>
            </div>
          ) : (
            videos.map((video) => {
              const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
              return (
                <div key={video.id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        Invalid Video URL
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold line-clamp-2 mb-3 leading-snug">{video.title}</h3>
                    <div className="flex items-center justify-between border-t pt-4">

                    </div>
                    <div className="flex justify-between items-center gap-2 mt-2">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm font-medium hover:underline flex items-center"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        YouTube
                      </a>
                      <div className='flex items-center gap-2'>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => openEditDialog(video)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
