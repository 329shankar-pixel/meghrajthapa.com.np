import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useState, useEffect } from 'react';
import { Trash2, Plus, Pencil, Calendar, Image as ImageIcon, History } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { store as storeTimeline, update as updateTimeline, destroy as destroyTimeline } from '@/actions/App/Http/Controllers/LeaderTimelineController';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Timeline {
  id: number;
  title: string;
  date: string;
  photo: string | null;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  timelines: Timeline[];
}

export default function Timelines({ leader, timelines }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const selection = useListSelection(timelines.map((timeline) => timeline.id));

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Timeline', href: '#' },
  ];

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    title: '',
    date: '',
    photo: null as File | null,
  });

  useEffect(() => {
    if (editingTimeline) {
      setData({
        title: editingTimeline.title,
        date: editingTimeline.date,
        photo: null,
      });
    } else {
      reset();
    }
    clearErrors();
  }, [editingTimeline]);

  const openCreateDialog = () => {
    setEditingTimeline(null);
    setIsDialogOpen(true);
  }

  const openEditDialog = (timeline: Timeline) => {
    setEditingTimeline(timeline);
    setIsDialogOpen(true);
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    if (editingTimeline) {
      // Force form data for file upload with PUT
      post(updateTimeline.url(editingTimeline.id, { query: { _method: 'PUT' } }), {
        forceFormData: true,
        onSuccess: () => {
          reset();
          setIsDialogOpen(false);
          setEditingTimeline(null);
        },
      });
    } else {
      post(storeTimeline.url(), {
        forceFormData: true,
        onSuccess: () => {
          reset();
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this timeline entry?')) {
      router.delete(destroyTimeline.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leader Timeline" />

      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leader Timeline</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Manage the journey of <strong>{leader.name}</strong>
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={openCreateDialog}>
                <Plus className="mr-2 h-5 w-5" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTimeline ? 'Edit Timeline Event' : 'Add New Timeline Event'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-5 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Enter event title"
                  />
                  <InputError message={errors.title} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={data.date}
                    onChange={(e) => setData('date', e.target.value)}
                  />
                  <InputError message={errors.date} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photo">Representative Photo (Optional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    onChange={(e) => setData('photo', e.target.files ? e.target.files[0] : null)}
                    accept="image/*"
                  />
                  {editingTimeline?.photo && !data.photo && (
                    <p className="text-xs text-muted-foreground italic">Current photo will be kept if you don't upload a new one.</p>
                  )}
                  <InputError message={errors.photo} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Saving...' : (editingTimeline ? 'Update Event' : 'Add Event')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={timelines.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="timeline events" />

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {timelines.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed bg-card/50 p-16 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No timeline events added yet.</p>
              <p className="text-muted-foreground mt-1">Add events to create a historical journey of the leader.</p>
            </div>
          ) : (
            timelines.map((timeline, index) => (
              <div key={timeline.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="absolute left-0 top-0 z-20 rounded-md bg-background/90 p-1 shadow-sm md:left-1/2 md:-translate-x-1/2 md:-translate-y-8">
                  <Checkbox checked={selection.selected.includes(timeline.id)} onCheckedChange={(checked) => selection.toggleOne(timeline.id, checked)} />
                </div>
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>

                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <time className="font-bold text-primary">{new Date(timeline.date).toLocaleDateString()}</time>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(timeline)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(timeline.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{timeline.title}</h3>
                  {timeline.photo && (
                    <div className="mt-4 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={`/storage/${timeline.photo}`}
                        alt={timeline.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
