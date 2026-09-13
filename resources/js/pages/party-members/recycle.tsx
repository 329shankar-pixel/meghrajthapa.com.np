import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';
import { Archive, Download, FileText, Filter, Globe, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PartyMemberType {
  id: number;
  name: string;
}

interface PartyMember {
  id: number;
  full_name: string;
  gender: string;
  phone: string;
  email: string;
  date_of_birth: string;
  province_id: number | null;
  district_id: number | null;
  municipality_id: number | null;
  ward_number: number | null;
  lives_abroad: boolean;
  country: string | null;
  party_member_type: PartyMemberType;
  deleted_at?: string | null;
}

interface PaginatedData {
  data: PartyMember[];
  last_page: number;
  total: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface LocationOption {
  id: number;
  name: string;
}

interface Filters {
  province_id?: string;
  district_id?: string;
  municipality_id?: string;
  ward_number?: string;
  party_member_type_id?: string;
  lives_abroad?: string;
}

interface Props {
  partyMembers: PaginatedData;
  filters: Filters;
  stats: {
    deleted: number;
    lives_abroad: number;
    by_type: Record<string, number>;
  };
  provinces: LocationOption[];
  memberTypes: PartyMemberType[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Party Members', href: '/party-members' },
  { title: 'Recycle Bin', href: '/party-members/recycle' },
];

export default function Recycle({ partyMembers, filters, stats, provinces, memberTypes }: Props) {
  const [filterValues, setFilterValues] = useState<Filters>({
    province_id: filters.province_id || 'all',
    district_id: filters.district_id || 'all',
    municipality_id: filters.municipality_id || 'all',
    ward_number: filters.ward_number || '',
    party_member_type_id: filters.party_member_type_id || 'all',
    lives_abroad: filters.lives_abroad || 'all',
  });
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [municipalities, setMunicipalities] = useState<LocationOption[]>([]);
  const selection = useListSelection(partyMembers.data.map((member) => member.id));

  useEffect(() => {
    if (filterValues.province_id && filterValues.province_id !== 'all') {
      fetch(`/api/provinces/${filterValues.province_id}/districts`)
        .then((response) => response.json())
        .then((data) => setDistricts(data))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
      setMunicipalities([]);
    }
  }, [filterValues.province_id]);

  useEffect(() => {
    if (filterValues.district_id && filterValues.district_id !== 'all') {
      fetch(`/api/districts/${filterValues.district_id}/municipalities`)
        .then((response) => response.json())
        .then((data) => setMunicipalities(data))
        .catch(() => setMunicipalities([]));
    } else {
      setMunicipalities([]);
    }
  }, [filterValues.district_id]);

  const cleanedFilters = () => {
    const params: Record<string, string> = {};
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params[key] = value;
      }
    });
    return params;
  };

  const queryString = () => new URLSearchParams({ ...cleanedFilters(), trashed: '1' }).toString();

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const next = { ...filterValues, [key]: value };
    if (key === 'province_id') {
      next.district_id = 'all';
      next.municipality_id = 'all';
    }
    if (key === 'district_id') {
      next.municipality_id = 'all';
    }
    setFilterValues(next);
    router.get('/party-members/recycle', next as Record<string, string>, { preserveState: true, preserveScroll: true });
  };

  const clearFilters = () => {
    const reset = {
      province_id: 'all',
      district_id: 'all',
      municipality_id: 'all',
      ward_number: '',
      party_member_type_id: 'all',
      lives_abroad: 'all',
    };
    setFilterValues(reset);
    router.get('/party-members/recycle', {}, { preserveState: true, preserveScroll: true });
  };

  const restore = (id: number) => {
    router.post(`/party-members/${id}/restore`, {}, { preserveScroll: true });
  };

  const bulkRestore = () => {
    if (selection.selectedCount === 0) return;
    router.post('/party-members/bulk-restore', { ids: selection.selected }, {
      preserveScroll: true,
      onSuccess: () => selection.clearSelection(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Party Member Recycle Bin" />

      <div className="space-y-6 p-6">
        <div className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-green-950 via-green-900 to-red-900 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                <Archive className="h-4 w-4" />
                Recoverable Records
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Party Member Recycle Bin</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
                Deleted member records stay recoverable here. Restore individual members or restore selected records after filtering.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/party-members-export/excel?${queryString()}`}>
                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </a>
              <a href={`/party-members-export/pdf?${queryString()}`}>
                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </a>
              <Link href="/party-members">
                <Button variant="secondary" className="rounded-full bg-white text-green-950 hover:bg-white/90">
                  Active Members
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.deleted}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Deleted</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{stats.lives_abroad}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Abroad</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-black">{Object.keys(stats.by_type).length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Member Types</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
            <Select value={filterValues.province_id} onValueChange={(value) => handleFilterChange('province_id', value)} disabled={filterValues.lives_abroad === 'yes'}>
              <SelectTrigger>
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>{province.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterValues.district_id} onValueChange={(value) => handleFilterChange('district_id', value)} disabled={filterValues.province_id === 'all' || filterValues.lives_abroad === 'yes'}>
              <SelectTrigger>
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterValues.municipality_id} onValueChange={(value) => handleFilterChange('municipality_id', value)} disabled={filterValues.district_id === 'all' || filterValues.lives_abroad === 'yes'}>
              <SelectTrigger>
                <SelectValue placeholder="All Municipalities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Municipalities</SelectItem>
                {municipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.id.toString()}>{municipality.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="number" placeholder="Ward" value={filterValues.ward_number || ''} onChange={(event) => handleFilterChange('ward_number', event.target.value)} disabled={filterValues.lives_abroad === 'yes'} />

            <Select value={filterValues.party_member_type_id} onValueChange={(value) => handleFilterChange('party_member_type_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {memberTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterValues.lives_abroad} onValueChange={(value) => handleFilterChange('lives_abroad', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Living Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="no">Lives in Nepal</SelectItem>
                <SelectItem value="yes">Lives Abroad</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {partyMembers.data.length === 0 ? (
            <div className="p-16 text-center">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-black">Recycle bin is empty</h2>
              <p className="mt-2 text-muted-foreground">Soft-deleted party members will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="p-3 pb-0">
                <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={partyMembers.data.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="deleted members" />
                {selection.selectedCount > 0 && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" className="rounded-full" onClick={bulkRestore}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore selected
                    </Button>
                  </div>
                )}
              </div>
              <table className="w-full">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deleted</th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {partyMembers.data.map((member) => (
                    <tr key={member.id} className="transition hover:bg-muted/10">
                      <td className="p-4">
                        <Checkbox checked={selection.selected.includes(member.id)} onCheckedChange={(checked) => selection.toggleOne(member.id, checked)} />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                        <div className="text-xs text-muted-foreground">{member.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {member.party_member_type?.name || 'Member'}
                        </span>
                      </td>
                      <td className="p-4">
                        {member.lives_abroad ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            <Globe className="h-3 w-3" />
                            {member.country || 'Abroad'}
                          </span>
                        ) : (
                          <span className="text-sm">Ward {member.ward_number || '-'}</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">{member.deleted_at ? new Date(member.deleted_at).toLocaleString() : 'Recently'}</td>
                      <td className="p-4 text-right">
                        <Button size="sm" className="rounded-full" onClick={() => restore(member.id)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {partyMembers.last_page > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {partyMembers.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground shadow-sm' : link.url ? 'border border-transparent hover:border-border hover:bg-muted' : 'cursor-not-allowed opacity-50 text-muted-foreground'}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
