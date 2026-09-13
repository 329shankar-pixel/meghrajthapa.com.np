import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2, Plus, Edit, Trash2, Users, Target, Heart, Zap, Star } from 'lucide-react';
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
import { store, update, destroy } from '@/actions/App/Http/Controllers/Settings/StatController';

interface Stat {
  id: number;
  icon: string | null;
  value: string;
  label: string;
  sort_order: number;
}

interface Props {
  stats: Stat[];
}

export default function StatsIndex({ stats }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Statistics', href: '#' },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    icon: 'Users',
    value: '',
    label: '',
    sort_order: 0,
  });

  const icons = [
    { name: 'Users', icon: Users },
    { name: 'Target', icon: Target },
    { name: 'Heart', icon: Heart },
    { name: 'Zap', icon: Zap },
    { name: 'Star', icon: Star },
  ];

  const openCreate = () => {
    setEditingStat(null);
    reset();
    setIsOpen(true);
  };

  const openEdit = (stat: Stat) => {
    setEditingStat(stat);
    setData({
      icon: stat.icon || 'Users',
      value: stat.value,
      label: stat.label,
      sort_order: stat.sort_order,
    });
    setIsOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStat) {
      put(update.url(editingStat.id), {
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
    if (confirm('Are you sure you want to delete this stat item?')) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Statistics Management" />

      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Counter Statistics</h1>
            <p className="text-muted-foreground">Manage the public impact metrics shown in the Hero section.</p>
          </div>
          <Button onClick={openCreate} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add New Counter
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = icons.find(i => i.name === stat.icon)?.icon || Users;
            return (
              <div key={stat.id} className="bg-card border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-4 group">
                <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black text-foreground">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(stat)} className="rounded-xl w-10 h-10 hover:bg-primary hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(stat.id)} className="rounded-xl w-10 h-10 hover:bg-destructive hover:text-white text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden border-none shadow-2xl">
            <form onSubmit={submit}>
              <DialogHeader className="p-10 bg-gray-50 dark:bg-gray-900 border-b">
                <DialogTitle className="text-3xl font-black tracking-tight">
                  {editingStat ? 'Edit Indicator' : 'New Indicator'}
                </DialogTitle>
                <DialogDescription className="text-lg">
                  Set a quantifiable metric of success.
                </DialogDescription>
              </DialogHeader>

              <div className="p-10 space-y-8">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Icon Representation</Label>
                    <Select value={data.icon || 'Users'} onValueChange={(val) => setData('icon', val)}>
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
                    <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantified Value</Label>
                    <Input
                      id="value"
                      value={data.value}
                      onChange={(e) => setData('value', e.target.value)}
                      placeholder="e.g., 50,000+"
                      className="h-14 rounded-2xl px-6 bg-muted/50 border-none focus-visible:bg-white transition-colors text-lg font-bold"
                      required
                    />
                    {errors.value && <p className="text-destructive text-xs ml-1">{errors.value}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attribute Label</Label>
                    <Input
                      id="label"
                      value={data.label}
                      onChange={(e) => setData('label', e.target.value)}
                      placeholder="e.g., Total Members"
                      className="h-14 rounded-2xl px-6 bg-muted/50 border-none focus-visible:bg-white transition-colors text-lg font-bold"
                      required
                    />
                    {errors.label && <p className="text-destructive text-xs ml-1">{errors.label}</p>}
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

              <DialogFooter className="p-10 pt-0 flex-col gap-4">
                <Button type="submit" size="lg" disabled={processing} className="w-full h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20">
                  {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingStat ? 'UPDATE METRIC' : 'ESTABLISH METRIC')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full h-16 rounded-[2rem] font-bold border-gray-200">
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
