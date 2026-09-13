import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, Bookmark, Download, Eye, Filter, FileText, MapPin, Search, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';
import { useEffect, useState } from 'react';

interface ResourcePhoto {
    id: number;
    photo_path: string;
}

interface Resource {
    id: number;
    title: string;
    description: string;
    project_category?: string | null;
    urgency?: string | null;
    province_name: string;
    district_name: string;
    municipality_name: string;
    ward_number: number;
    person_name: string;
    person_phone?: string | null;
    is_important: boolean;
    bookmarked_at?: string | null;
    photos: ResourcePhoto[];
}

interface PaginatedResources {
    data: Resource[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface LocationOption {
    id: number;
    name: string;
}

interface Props {
    resources: PaginatedResources;
    filters: {
        search?: string;
        priority?: string;
        province_id?: string;
        district_id?: string;
        municipality_id?: string;
        ward_number?: string;
    };
    stats: {
        bookmarked: number;
        important: number;
    };
    provinces: LocationOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Bookmarked Projects', href: '/resources/bookmarks' },
];

export default function BookmarkedProjects({ resources, filters: initialFilters, stats, provinces }: Props) {
    const [filters, setFilters] = useState({ priority: 'all', ...initialFilters });
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [municipalities, setMunicipalities] = useState<LocationOption[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const selection = useListSelection(resources.data.map((resource) => resource.id));

    useEffect(() => {
        if (filters.province_id && filters.province_id !== 'all') {
            setLoadingDistricts(true);
            fetch(`/api/provinces/${filters.province_id}/districts`)
                .then((response) => response.json())
                .then((data) => setDistricts(data))
                .finally(() => setLoadingDistricts(false));
        } else {
            setDistricts([]);
        }
    }, [filters.province_id]);

    useEffect(() => {
        if (filters.district_id && filters.district_id !== 'all') {
            setLoadingMunicipalities(true);
            fetch(`/api/districts/${filters.district_id}/municipalities`)
                .then((response) => response.json())
                .then((data) => setMunicipalities(data))
                .finally(() => setLoadingMunicipalities(false));
        } else {
            setMunicipalities([]);
        }
    }, [filters.district_id]);

    const updateFilter = (key: keyof typeof filters, value: string) => {
        const next = { ...filters, [key]: value };
        if (key === 'province_id') {
            next.district_id = 'all';
            next.municipality_id = 'all';
        }
        if (key === 'district_id') {
            next.municipality_id = 'all';
        }
        setFilters(next);
    };

    const cleanedFilters = () => {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params[key] = value;
            }
        });
        return params;
    };

    const queryString = () => new URLSearchParams({ ...cleanedFilters(), only_bookmarked: '1' }).toString();

    const applyFilters = () => {
        router.get('/resources/bookmarks', cleanedFilters(), { preserveScroll: true, preserveState: true });
    };

    const clearFilters = () => {
        setFilters({ priority: 'all' });
        router.get('/resources/bookmarks', {}, { preserveScroll: true, preserveState: true });
    };

    const unbookmark = (id: number) => {
        router.post(`/resources/${id}/bookmark`, {}, { preserveScroll: true });
    };

    const softDelete = (id: number, title: string) => {
        if (confirm(`Move ${title} to the recycle bin?`)) {
            router.delete(`/resources/${id}`, { preserveScroll: true });
        }
    };

    const bulkDelete = () => {
        if (selection.selectedCount === 0) return;
        if (confirm(`Move ${selection.selectedCount} bookmarked project(s) to the recycle bin?`)) {
            router.post('/resources/bulk-delete', { ids: selection.selected }, {
                preserveScroll: true,
                onSuccess: () => selection.clearSelection(),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookmarked Projects" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-green-950 via-green-900 to-red-900 p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                                <Bookmark className="h-4 w-4 fill-current" />
                                Saved Community Projects
                            </div>
                            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Bookmarked Projects</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 md:text-base">
                                Filter saved projects by Nepal local-state location, review them in a dense admin table, and prepare campaign follow-up lists.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a href={`/resources-export/excel?${queryString()}`}>
                                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                                    <Download className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                            </a>
                            <a href={`/resources-export/pdf?${queryString()}`}>
                                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                                    <FileText className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                            </a>
                            <Link href="/resources/recycle">
                                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                                    <Archive className="mr-2 h-4 w-4" />
                                    Recycle
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:w-fit">
                        <div className="rounded-2xl bg-white/10 p-4 text-center">
                            <p className="text-3xl font-black">{stats.bookmarked}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Bookmarked</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 text-center">
                            <p className="text-3xl font-black">{stats.important}</p>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Important</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        Location Filter
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search saved projects, categories, people..." className="pl-9" />
                        </div>
                        <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilter('priority', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookmarks</SelectItem>
                                <SelectItem value="important">Important Only</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.province_id || 'all'} onValueChange={(value) => updateFilter('province_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Province" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Provinces</SelectItem>
                                {provinces.map((province) => (
                                    <SelectItem key={province.id} value={province.id.toString()}>{province.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.district_id || 'all'} onValueChange={(value) => updateFilter('district_id', value)} disabled={!filters.province_id || filters.province_id === 'all' || loadingDistricts}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingDistricts ? 'Loading...' : 'District'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Districts</SelectItem>
                                {districts.map((district) => (
                                    <SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.municipality_id || 'all'} onValueChange={(value) => updateFilter('municipality_id', value)} disabled={!filters.district_id || filters.district_id === 'all' || loadingMunicipalities}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingMunicipalities ? 'Loading...' : 'Municipality'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Municipalities</SelectItem>
                                {municipalities.map((municipality) => (
                                    <SelectItem key={municipality.id} value={municipality.id.toString()}>{municipality.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input type="number" value={filters.ward_number || ''} onChange={(event) => updateFilter('ward_number', event.target.value)} placeholder="Ward" />
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button type="button" onClick={applyFilters} className="rounded-full">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} className="rounded-full">
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>

                {resources.data.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed bg-card/70 p-16 text-center">
                        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-black">No bookmarked projects found</h2>
                        <p className="mt-2 text-muted-foreground">Bookmark projects from the Resources page to keep them here.</p>
                        <Link href="/resources" className="mt-6 inline-flex">
                            <Button>Browse Projects</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="p-3 pb-0">
                            <ListSelectionToolbar
                                selectedCount={selection.selectedCount}
                                totalCount={resources.data.length}
                                allSelected={selection.allSelected}
                                onToggleAll={selection.toggleAll}
                                onClear={selection.clearSelection}
                                label="bookmarked projects"
                            />
                            {selection.selectedCount > 0 && (
                                <div className="mt-3 flex justify-end">
                                    <Button variant="destructive" size="sm" className="rounded-full" onClick={bulkDelete}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Move selected to recycle
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="w-12 p-5"></th>
                                        <th className="p-5 text-left font-semibold">Project</th>
                                        <th className="p-5 text-left font-semibold">Priority</th>
                                        <th className="p-5 text-left font-semibold">Location</th>
                                        <th className="p-5 text-left font-semibold">Contact</th>
                                        <th className="p-5 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {resources.data.map((resource) => (
                                        <tr key={resource.id} className="transition hover:bg-muted/30">
                                            <td className="p-5">
                                                <Checkbox checked={selection.selected.includes(resource.id)} onCheckedChange={(checked) => selection.toggleOne(resource.id, checked)} />
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                                                        {resource.photos?.[0] ? (
                                                            <img src={`/storage/${resource.photos[0].photo_path}`} alt={resource.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Bookmark className="h-5 w-5 text-primary" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black">{resource.title}</div>
                                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{resource.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    {resource.is_important && (
                                                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Important
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">{resource.project_category || 'Community project'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                                                    <div>
                                                        <p className="font-semibold">{resource.municipality_name}, Ward {resource.ward_number}</p>
                                                        <p className="text-xs text-muted-foreground">{resource.district_name}, {resource.province_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-semibold">{resource.person_name}</p>
                                                <p className="text-xs text-muted-foreground">{resource.person_phone || 'No phone'}</p>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary" title="Remove bookmark" onClick={() => unbookmark(resource.id)}>
                                                        <Bookmark className="h-4 w-4 fill-current" />
                                                    </Button>
                                                    <Link href={`/resources/${resource.id}`}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => softDelete(resource.id, resource.title)}>
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
                )}

                {resources.last_page > 1 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {resources.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${link.active ? 'bg-primary text-primary-foreground' : link.url ? 'border bg-card hover:bg-muted' : 'pointer-events-none opacity-40'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
