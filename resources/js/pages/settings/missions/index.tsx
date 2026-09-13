import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Loader2, Plus, Edit, Trash2, Zap, Shield, Target, Star, Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { store, update, destroy } from '@/actions/App/Http/Controllers/Settings/MissionController';

interface Mission {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  color: string;
  sort_order: number;
}

interface Props {
  missions: Mission[];
}

export default function MissionsIndex({ missions }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Missions', href: '#' },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: '',
    description: '',
    icon: 'Zap',
    color: 'red',
    sort_order: 0,
  });

  const icons = [
    { name: 'Zap', icon: Zap },
    { name: 'Shield', icon: Shield },
    { name: 'Target', icon: Target },
    { name: 'Star', icon: Star },
    { name: 'Heart', icon: Heart },
  ];

  const colors = [
    { name: 'red', class: 'bg-[var(--political-red)]' },
    { name: 'green', class: 'bg-[var(--political-green)]' },
    { name: 'blue', class: 'bg-blue-600' },
    { name: 'gray', class: 'bg-gray-600' },
  ];

  const openCreate = () => {
    setEditingMission(null);
    reset();
    setIsOpen(true);
  };

  const openEdit = (mission: Mission) => {
    setEditingMission(mission);
    setData({
      title: mission.title,
      description: mission.description,
      icon: mission.icon || 'Zap',
      color: mission.color,
      sort_order: mission.sort_order,
    });
    setIsOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMission) {
      put(update.url(editingMission.id), {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    } else {
      post(store.url(), {
        onSuccess: () => {
          setIsOpen(false);
          reset();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this mission item?')) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mission Management" />

      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Mission & Vision Items</h1>
            <p className="text-muted-foreground">Manage the core pillars displayed on your homepage.</p>
          </div>
          <Button onClick={openCreate} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add New Pillar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => {
            const IconComponent = icons.find(i => i.name === mission.icon)?.icon || Zap;
            return (
              <div key={mission.id} className="group bg-card border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-[4rem] ${mission.color === 'green' ? 'bg-[var(--political-green)]' : 'bg-[var(--political-red)]'}`} />

                <div className="space-y-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${mission.color === 'green' ? 'bg-[var(--political-green)]' : 'bg-[var(--political-red)]'}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-foreground mb-2">{mission.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {mission.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => openEdit(mission)} className="rounded-xl h-9 hover:bg-primary hover:text-white transition-colors">
                      <Edit className="w-4 h-4 mr-1.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(mission.id)} className="rounded-xl h-9 hover:bg-destructive hover:text-white transition-colors text-destructive">
                      <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {missions.length === 0 && (
            <div className="col-span-full py-20 text-center bg-muted/20 rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-muted-foreground font-medium text-lg">No mission items found. Start by adding one!</p>
            </div>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="rounded-[2.5rem] max-w-xl p-0 overflow-hidden border-none shadow-2xl">
            <form onSubmit={submit}>
              <DialogHeader className="p-10 bg-gray-50 dark:bg-gray-900 border-b">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {editingMission ? 'Refine Vision Pillar' : 'Establish New pillar'}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  Define a core mission or vision for the movement.
                </DialogDescription>
              </DialogHeader>

              <div className="p-10 space-y-8">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Pillar Title</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="e.g., Economic Empowerment"
                      className="h-14 rounded-2xl px-6 bg-muted/50 border-none focus-visible:bg-white transition-colors text-lg font-bold"
                    />
                    {errors.title && <p className="text-destructive text-xs ml-1">{errors.title}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Strategy Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Detail the approach and objectives..."
                      className="min-h-[120px] rounded-2xl p-6 bg-muted/50 border-none focus-visible:bg-white transition-colors"
                    />
                    {errors.description && <p className="text-destructive text-xs ml-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Symbolic Icon</Label>
                      <Select value={data.icon || 'Zap'} onValueChange={(val) => setData('icon', val)}>
                        <SelectTrigger className="h-14 rounded-2xl px-6 bg-muted/50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          {icons.map((item) => (
                            <SelectItem key={item.name} value={item.name} className="rounded-xl py-3 px-4">
                              <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-primary" />
                                <span className="font-bold">{item.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Brand Color</Label>
                      <Select value={data.color} onValueChange={(val) => setData('color', val)}>
                        <SelectTrigger className="h-14 rounded-2xl px-6 bg-muted/50 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          {colors.map((item) => (
                            <SelectItem key={item.name} value={item.name} className="rounded-xl py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full ${item.class}`} />
                                <span className="font-bold capitalize">{item.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sort_order" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sequence Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                      className="h-14 rounded-2xl px-6 bg-muted/50 border-none focus-visible:bg-white transition-colors font-bold"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="p-10 pt-0 flex-col md:flex-row gap-4">
                <Button type="submit" size="lg" disabled={processing} className="w-full md:flex-1 h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20">
                  {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingMission ? 'UPDATE PILLAR' : 'ESTABLISH PILLAR')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full md:w-32 h-16 rounded-[2rem] font-bold border-gray-200">
                  CANCEL
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
