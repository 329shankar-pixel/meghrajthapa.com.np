import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  create,
  edit,
  show,
  destroy
} from '@/actions/App/Http/Controllers/EventController';
import { Plus, Pencil, Trash2, Calendar, MapPin, Eye, Filter, X, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Event {
  id: number;
  title: string;
  slug: string;
  event_date: string;
  location: string | null;
  province_name?: string;
  district_name?: string;
  municipality_name?: string;
  volunteers_count: number;
  created_at: string;
}

interface PaginatedData {
  data: Event[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Province {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
  province_id: number;
}

interface Municipality {
  id: number;
  name: string;
  district_id: number;
}

interface Filters {
  province_id: string;
  district_id: string;
  municipality_id: string;
  ward_number: string;
}

interface Props {
  events: PaginatedData;
  filters: Filters;
  provinces: Province[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Events', href: '/events' },
];

export default function Index({ events, filters, provinces }: Props) {
  const [filterValues, setFilterValues] = useState<Filters>({
    province_id: filters.province_id || 'all',
    district_id: filters.district_id || 'all',
    municipality_id: filters.municipality_id || 'all',
    ward_number: filters.ward_number || '',
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const selection = useListSelection(events.data.map((event) => event.id));

  // Fetch districts when province changes and matches current filter
  useEffect(() => {
    if (filterValues.province_id && filterValues.province_id !== 'all') {
      fetch(`/api/provinces/${filterValues.province_id}/districts`)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
      setMunicipalities([]);
    }
  }, [filterValues.province_id]);

  // Fetch municipalities when district changes and matches current filter
  useEffect(() => {
    if (filterValues.district_id && filterValues.district_id !== 'all') {
      fetch(`/api/districts/${filterValues.district_id}/municipalities`)
        .then(res => res.json())
        .then(data => setMunicipalities(data))
        .catch(() => setMunicipalities([]));
    } else {
      setMunicipalities([]);
    }
  }, [filterValues.district_id]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filterValues, [key]: value };

    // Reset child filters
    if (key === 'province_id') {
      newFilters.district_id = 'all';
      newFilters.municipality_id = 'all';
    } else if (key === 'district_id') {
      newFilters.municipality_id = 'all';
    }

    setFilterValues(newFilters);

    router.get(
      '/events',
      { ...newFilters } as any,
      { preserveState: true, preserveScroll: true }
    );
  };

  const clearFilters = () => {
    const resetFilters = {
      province_id: 'all',
      district_id: 'all',
      municipality_id: 'all',
      ward_number: '',
    };
    setFilterValues(resetFilters);
    router.get('/events', {}, { preserveState: true });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Events Management" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between pb-4 border-b">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage events and gatherings ({events.total} total)
            </p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Link href={create().url}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Province Filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Province</span>
            <Select
              value={filterValues.province_id}
              onValueChange={(val) => handleFilterChange('province_id', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">District</span>
            <Select
              value={filterValues.district_id}
              onValueChange={(val) => handleFilterChange('district_id', val)}
              disabled={filterValues.province_id === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Municipality Filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Municipality</span>
            <Select
              value={filterValues.municipality_id}
              onValueChange={(val) => handleFilterChange('municipality_id', val)}
              disabled={filterValues.district_id === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Municipalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ward Filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground ml-1">Ward No.</span>
            <div className="relative">
              <Input
                type="number"
                placeholder="Ward..."
                value={filterValues.ward_number}
                onChange={(e) => handleFilterChange('ward_number', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {events.data.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No events found</p>
            <Link href={create().url}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-3 pb-0">
                <ListSelectionToolbar
                  selectedCount={selection.selectedCount}
                  totalCount={events.data.length}
                  allSelected={selection.allSelected}
                  onToggleAll={selection.toggleAll}
                  onClear={selection.clearSelection}
                  label="events"
                />
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-center p-4 font-medium">Volunteers</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Checkbox checked={selection.selected.includes(item.id)} onCheckedChange={(checked) => selection.toggleOne(item.id, checked)} />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(item.event_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {item.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium text-foreground">{item.location}</span>
                            </div>
                          )}
                          {(item.province_name || item.district_name) && (
                            <div className="text-xs ml-6">
                              {[item.municipality_name, item.district_name, item.province_name].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          <Users className="h-3.5 w-3.5" />
                          {item.volunteers_count}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={show.url(item.id)}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={edit.url(item.id)}>
                            <Button size="sm" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id, item.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {events.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {events.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-2 rounded text-sm ${link.active
                      ? 'bg-primary text-primary-foreground'
                      : link.url
                        ? 'hover:bg-muted'
                        : 'opacity-50 cursor-not-allowed'
                      }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
