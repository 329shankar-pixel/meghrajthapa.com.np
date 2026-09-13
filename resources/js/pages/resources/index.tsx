import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  index,
  create,
  show,
  edit,
  destroy
} from '@/actions/App/Http/Controllers/ResourceController';
import { Plus, Eye, Trash2, Filter, X, MapPin, Users, Edit2, Bookmark, Star, BadgeCheck, Archive, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SpotlightCard from '@/components/SpotlightCard';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface ResourcePhoto {
  id: number;
  photo_path: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  province_id: number;
  district_id: number;
  municipality_id: number;
  ward_number: number;
  province_name: string;
  district_name: string;
  municipality_name: string;
  person_name: string;
  person_email: string;
  person_phone: string;
  photos: ResourcePhoto[];
  is_bookmarked: boolean;
  is_important: boolean;
  project_category?: string | null;
  urgency?: string | null;
  created_at: string;
}

interface PaginatedData {
  data: Resource[];
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
}

interface Municipality {
  id: number;
  name: string;
}

interface Stats {
  total: number;
  bookmarked: number;
  important: number;
  by_province: Array<{
    name: string;
    count: number;
  }>;
}

interface Props {
  resources: PaginatedData;
  filters: {
    province_id?: string;
    district_id?: string;
    municipality_id?: string;
    ward_number?: string;
    search?: string;
    status?: string;
  };
  stats: Stats;
  provinces: Province[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Resources', href: '/resources' },
];

export default function Index({ resources, filters: initialFilters, stats, provinces }: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const selection = useListSelection(resources.data.map((resource) => resource.id));

  useEffect(() => {
    if (filters.province_id) {
      setLoadingDistricts(true);
      fetch(`/api/provinces/${filters.province_id}/districts`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data);
          setLoadingDistricts(false);
        })
        .catch(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
    }
  }, [filters.province_id]);

  useEffect(() => {
    if (filters.district_id) {
      setLoadingMunicipalities(true);
      fetch(`/api/districts/${filters.district_id}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(data);
          setLoadingMunicipalities(false);
        })
        .catch(() => setLoadingMunicipalities(false));
    } else {
      setMunicipalities([]);
    }
  }, [filters.district_id]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'province_id') {
      newFilters.district_id = 'all';
      newFilters.municipality_id = 'all';
    }
    if (key === 'district_id') {
      newFilters.municipality_id = 'all';
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const cleanedFilters = { ...filters };
    Object.keys(cleanedFilters).forEach(key => {
      if (cleanedFilters[key as keyof typeof cleanedFilters] === 'all') {
        cleanedFilters[key as keyof typeof cleanedFilters] = '';
      }
    });
    router.get(index().url, cleanedFilters, { preserveState: true });
  };

  const resetFilters = () => {
    setFilters({});
    router.get(index().url, {}, { preserveState: true });
  };

  const exportQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    return params.toString();
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Move ${title} to the recycle bin?`)) {
      router.delete(destroy.url(id));
    }
  };

  const handleBulkDelete = () => {
    if (selection.selectedCount === 0) return;
    if (confirm(`Move ${selection.selectedCount} selected project(s) to the recycle bin?`)) {
      router.post('/resources/bulk-delete', { ids: selection.selected }, {
        preserveScroll: true,
        onSuccess: () => selection.clearSelection(),
      });
    }
  };

  const handleImport = (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    router.post('/resources-upload/import', formData, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        if (importInputRef.current) {
          importInputRef.current.value = '';
        }
      },
    });
  };

  const toggleBookmark = (id: number) => {
    router.post(`/resources/${id}/bookmark`, {}, { preserveScroll: true });
  };

  const toggleImportant = (id: number) => {
    router.post(`/resources/${id}/important`, {}, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Resources" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resources</h1>
            <p className="text-muted-foreground mt-1">
              Manage local resources and assets ({resources.total} total)
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a href="/resources-upload/template">
              <Button variant="outline" className="rounded-full">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Template
              </Button>
            </a>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />
            <Button variant="outline" className="rounded-full" onClick={() => importInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel
            </Button>
            <a href={`/resources-export/excel${exportQuery() ? `?${exportQuery()}` : ''}`}>
              <Button variant="outline" className="rounded-full">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </a>
            <a href={`/resources-export/pdf${exportQuery() ? `?${exportQuery()}` : ''}`}>
              <Button variant="outline" className="rounded-full">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </a>
            <Link href="/resources/recycle">
              <Button variant="outline" className="rounded-full">
                <Archive className="mr-2 h-4 w-4" />
                Recycle
              </Button>
            </Link>
            <Link href={create().url}>
              <Button size="lg" className="rounded-full px-6">
                <Plus className="mr-2 h-5 w-5" />
                Add Resource
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SpotlightCard className="p-6 flex items-center gap-4 bg-card border rounded-2xl">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 flex items-center gap-4 bg-card border rounded-2xl">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Important Projects</p>
              <h3 className="text-2xl font-bold">{stats.important}</h3>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 flex items-center gap-4 bg-card border rounded-2xl">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bookmarked</p>
              <h3 className="text-2xl font-bold">{stats.bookmarked}</h3>
            </div>
          </SpotlightCard>

          {stats.by_province.slice(0, 1).map((province, idx) => (
            <SpotlightCard key={idx} className="p-6 flex items-center gap-4 bg-card border rounded-2xl">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <MapPin className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{province.name}</p>
                <h3 className="text-2xl font-bold">{province.count}</h3>
              </div>
            </SpotlightCard>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4 items-end">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <label className="text-xs font-medium ml-1">Search</label>
              <Input
                placeholder="Search title, contact, phone..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">Status</label>
              <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="bookmarked">Bookmarked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">Province</label>
              <Select value={filters.province_id || 'all'} onValueChange={(v) => handleFilterChange('province_id', v)}>
                <SelectTrigger className="bg-background">
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

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">District</label>
              <Select
                value={filters.district_id || 'all'}
                onValueChange={(v) => handleFilterChange('district_id', v)}
                disabled={!filters.province_id || filters.province_id === 'all' || loadingDistricts}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={loadingDistricts ? "Loading..." : "All Districts"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">Municipality</label>
              <Select
                value={filters.municipality_id || 'all'}
                onValueChange={(v) => handleFilterChange('municipality_id', v)}
                disabled={!filters.district_id || filters.district_id === 'all' || loadingMunicipalities}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={loadingMunicipalities ? "Loading..." : "All Municipalities"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Municipalities</SelectItem>
                  {municipalities.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium ml-1">Ward</label>
              <Input
                type="number"
                placeholder="Ward No."
                value={filters.ward_number || ''}
                onChange={(e) => handleFilterChange('ward_number', e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">Apply</Button>
              <Button onClick={resetFilters} variant="outline" size="icon" className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        {resources.data.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-20 text-center bg-muted/20">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No resources found</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Try adjusting your filters or add a new resource to get started.</p>
            <Link href={create().url}>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add First Resource
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <div className="p-3 pb-0">
                <ListSelectionToolbar
                  selectedCount={selection.selectedCount}
                  totalCount={resources.data.length}
                  allSelected={selection.allSelected}
                  onToggleAll={selection.toggleAll}
                  onClear={selection.clearSelection}
                  label="projects"
                />
                {selection.selectedCount > 0 && (
                  <div className="mt-3 flex justify-end">
                    <Button variant="destructive" size="sm" className="rounded-full" onClick={handleBulkDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Move selected to recycle
                    </Button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="w-12 p-5"></th>
                      <th className="text-left p-5 font-semibold">Project Title</th>
                      <th className="text-left p-5 font-semibold">Priority</th>
                      <th className="text-left p-5 font-semibold">Location</th>
                      <th className="text-left p-5 font-semibold">Contact Person</th>
                      <th className="text-left p-5 font-semibold">Photos</th>
                      <th className="text-right p-5 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {resources.data.map((resource) => (
                      <tr key={resource.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-5">
                          <Checkbox checked={selection.selected.includes(resource.id)} onCheckedChange={(checked) => selection.toggleOne(resource.id, checked)} />
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">{resource.title}</div>
                            {resource.is_bookmarked && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
                            {resource.is_important && <Star className="h-4 w-4 fill-amber-400 text-amber-500" />}
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{resource.description}</p>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              resource.urgency === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200' : 'bg-muted text-muted-foreground'
                            }`}>
                              <BadgeCheck className="h-3 w-3" />
                              {resource.urgency || 'Normal'}
                            </span>
                            {resource.project_category && <span className="text-xs text-muted-foreground">{resource.project_category}</span>}
                          </div>
                        </td>
                        <td className="p-5 text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground font-medium">{resource.municipality_name}, Ward {resource.ward_number}</span>
                            <span className="text-xs">{resource.district_name}, {resource.province_name}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-medium">{resource.person_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{resource.person_phone}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex -space-x-2">
                            {resource.photos.slice(0, 3).map((photo, i) => (
                              <div key={i} className="h-8 w-8 rounded-full border-2 border-card overflow-hidden bg-muted">
                                <img src={`/storage/${photo.photo_path}`} alt="" className="h-full w-full object-cover" />
                              </div>
                            ))}
                            {resource.photos.length > 3 && (
                              <div className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                                +{resource.photos.length - 3}
                              </div>
                            )}
                            {resource.photos.length === 0 && <span className="text-muted-foreground italic text-xs">No photos</span>}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-8 w-8 rounded-full ${resource.is_bookmarked ? 'text-primary bg-primary/10' : ''}`}
                              onClick={() => toggleBookmark(resource.id)}
                              title={resource.is_bookmarked ? 'Remove bookmark' : 'Bookmark project'}
                            >
                              <Bookmark className={`h-4 w-4 ${resource.is_bookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-8 w-8 rounded-full ${resource.is_important ? 'text-amber-500 bg-amber-500/10' : ''}`}
                              onClick={() => toggleImportant(resource.id)}
                              title={resource.is_important ? 'Unmark important' : 'Mark important'}
                            >
                              <Star className={`h-4 w-4 ${resource.is_important ? 'fill-current' : ''}`} />
                            </Button>
                            <Link href={show.url(resource.id)}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={edit.url(resource.id)}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(resource.id, resource.title)}
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
            </div>

            {/* Pagination */}
            {resources.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {resources.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${link.active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 font-bold'
                      : link.url
                        ? 'bg-card border hover:border-primary/50 hover:bg-primary/5'
                        : 'opacity-40 cursor-not-allowed bg-muted'
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
