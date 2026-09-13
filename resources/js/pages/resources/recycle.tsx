import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, Download, Eye, FileText, Filter, RotateCcw, Search, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';
import { useEffect, useState } from 'react';

interface Resource {
    id: number;
    title: string;
    description: string;
    project_category?: string | null;
    province_name: string;
    district_name: string;
    municipality_name: string;
    ward_number: number;
    person_name: string;
    is_bookmarked: boolean;
    is_important: boolean;
    deleted_at?: string | null;
}

interface PaginatedResources {
    data: Resource[];
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
        province_id?: string;
        district_id?: string;
        municipality_id?: string;
        ward_number?: string;
        status?: string;
    };
    stats: {
        deleted: number;
        important: number;
        bookmarked: number;
    };
    provinces: LocationOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resources', href: '/resources' },
    { title: 'Recycle Bin', href: '/resources/recycle' },
];

export default function Recycle({ resources, filters: initialFilters, stats, provinces }: Props) {
    const [filters, setFilters] = useState(initialFilters || {});
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

    const queryString = () => new URLSearchParams({ ...cleanedFilters(), trashed: '1' }).toString();

    const applyFilters = () => {
        router.get('/resources/recycle', cleanedFilters(), { preserveScroll: true, preserveState: true });
    };

    const clearFilters = () => {
        setFilters({});
        router.get('/resources/recycle', {}, { preserveScroll: true, preserveState: true });
    };

    const restore = (id: number) => {
        router.post(`/resources/${id}/restore`, {}, { preserveScroll: true });
    };

    const bulkRestore = () => {
        if (selection.selectedCount === 0) return;
        router.post('/resources/bulk-restore', { ids: selection.selected }, {
            preserveScroll: true,
            onSuccess: () => selection.clearSelection(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resource Recycle Bin" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="overflow-hidden rounded-[2rem] border bg-card p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                <Archive className="h-4 w-4" />
                                Soft Deleted Data
                            </div>
                            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Resource Recycle Bin</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Deleted projects stay recoverable here. Restore one record or recover selected records after filtering by local-state location.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a href={`/resources-export/excel?${queryString()}`}>
                                <Button variant="outline" className="rounded-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                            </a>
                            <a href={`/resources-export/pdf?${queryString()}`}>
                                <Button variant="outline" className="rounded-full">
                                    <FileText className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                            </a>
                            <Link href="/resources">
                                <Button className="rounded-full">Active Resources</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border bg-muted/30 p-4">
                            <p className="text-2xl font-black">{stats.deleted}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deleted</p>
                        </div>
                        <div className="rounded-2xl border bg-muted/30 p-4">
                            <p className="text-2xl font-black">{stats.bookmarked}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bookmarked</p>
                        </div>
                        <div className="rounded-2xl border bg-muted/30 p-4">
                            <p className="text-2xl font-black">{stats.important}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Important</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search deleted projects..." className="pl-9" />
                        </div>
                        <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Deleted</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="bookmarked">Bookmarked</SelectItem>
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
                    <div className="mt-4 flex justify-end gap-2">
                        <Button onClick={applyFilters} className="rounded-full">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" onClick={clearFilters} className="rounded-full">
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>

                {resources.data.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed bg-card/70 p-16 text-center">
                        <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-2xl font-black">Recycle bin is empty</h2>
                        <p className="mt-2 text-muted-foreground">Soft-deleted projects will appear here for recovery.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="p-3 pb-0">
                            <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={resources.data.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="deleted projects" />
                            {selection.selectedCount > 0 && (
                                <div className="mt-3 flex justify-end">
                                    <Button size="sm" className="rounded-full" onClick={bulkRestore}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore selected
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
                                        <th className="p-5 text-left font-semibold">Flags</th>
                                        <th className="p-5 text-left font-semibold">Location</th>
                                        <th className="p-5 text-left font-semibold">Deleted</th>
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
                                                <p className="font-black">{resource.title}</p>
                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{resource.description}</p>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {resource.is_bookmarked && <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">Bookmarked</span>}
                                                    {resource.is_important && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-black uppercase text-amber-950">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Important
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <p className="font-semibold">{resource.municipality_name}, Ward {resource.ward_number}</p>
                                                <p className="text-xs text-muted-foreground">{resource.district_name}, {resource.province_name}</p>
                                            </td>
                                            <td className="p-5 text-xs text-muted-foreground">{resource.deleted_at ? new Date(resource.deleted_at).toLocaleString() : 'Recently'}</td>
                                            <td className="p-5">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/resources/${resource.id}`}>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" disabled>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" className="rounded-full" onClick={() => restore(resource.id)}>
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        Restore
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
