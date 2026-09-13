import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  create,
  show,
  edit,
  destroy,
  sendEmail
} from '@/actions/App/Http/Controllers/PartyMemberController';
import { Plus, Eye, Trash2, Edit2, Users, UserCheck, UserPlus, Filter, X, Globe, FileSpreadsheet, FileText, Mail, Upload, Archive } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

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
  joined_nc_at: string | null;
  province_id: number | null;
  district_id: number | null;
  municipality_id: number | null;
  ward_number: number | null;
  lives_abroad: boolean;
  country: string | null;
  party_member_type: PartyMemberType;
  created_at: string;
}

interface PaginatedData {
  data: PartyMember[];
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

interface Stats {
  total_members: number;
  by_gender: Record<string, number>;
  by_type: Record<string, number>;
  lives_abroad: number;
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
  party_member_type_id: string;
  lives_abroad: string;
}

interface Props {
  partyMembers: PaginatedData;
  filters: Filters;
  stats: Stats;
  provinces: Province[];
  memberTypes: PartyMemberType[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Party Members', href: '/party-members' },
];

export default function Index({ partyMembers, filters, stats, provinces, memberTypes }: Props) {
  const [filterValues, setFilterValues] = useState<Filters>({
    province_id: filters.province_id || 'all',
    district_id: filters.district_id || 'all',
    municipality_id: filters.municipality_id || 'all',
    ward_number: filters.ward_number || '',
    party_member_type_id: filters.party_member_type_id || 'all',
    lives_abroad: filters.lives_abroad || 'all',
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const selection = useListSelection(partyMembers.data.map((member) => member.id));

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
      '/party-members',
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
      party_member_type_id: 'all',
      lives_abroad: 'all',
    };
    setFilterValues(resetFilters);
    router.get('/party-members', {}, { preserveState: true });
  };

  const { data: emailData, setData: setEmailData, post: postEmail, processing: sendingEmail, reset: resetEmail, errors: emailErrors } = useForm({
    subject: '',
    content: '',
    attachment: null as File | null,
    filters: filterValues,
  });

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    postEmail(sendEmail.url(), {
      onSuccess: () => {
        setIsEmailModalOpen(false);
        resetEmail();
      },
    });
  };

  useEffect(() => {
    setEmailData('filters', filterValues);
  }, [filterValues]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Move ${name} to the recycle bin?`)) {
      router.delete(destroy.url(id));
    }
  };

  const handleBulkDelete = () => {
    if (selection.selectedCount === 0) return;
    if (confirm(`Move ${selection.selectedCount} selected member(s) to the recycle bin?`)) {
      router.post('/party-members/bulk-delete', { ids: selection.selected }, {
        preserveScroll: true,
        onSuccess: () => selection.clearSelection(),
      });
    }
  };

  const handleImport = (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    router.post('/party-members-upload/import', formData, {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        if (importInputRef.current) {
          importInputRef.current.value = '';
        }
      },
    });
  };

  const buildExportUrl = (format: 'excel' | 'pdf') => {
    const params = new URLSearchParams();
    if (filterValues.province_id && filterValues.province_id !== 'all') {
      params.append('province_id', filterValues.province_id);
    }
    if (filterValues.district_id && filterValues.district_id !== 'all') {
      params.append('district_id', filterValues.district_id);
    }
    if (filterValues.municipality_id && filterValues.municipality_id !== 'all') {
      params.append('municipality_id', filterValues.municipality_id);
    }
    if (filterValues.ward_number) {
      params.append('ward_number', filterValues.ward_number);
    }
    if (filterValues.party_member_type_id && filterValues.party_member_type_id !== 'all') {
      params.append('party_member_type_id', filterValues.party_member_type_id);
    }
    if (filterValues.lives_abroad && filterValues.lives_abroad !== 'all') {
      params.append('lives_abroad', filterValues.lives_abroad);
    }
    const queryString = params.toString();
    return `/party-members-export/${format}${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Party Members" />

      <div className="p-6 space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpotlightCard className="w-full bg-card border-border" spotlightColor="rgba(var(--primary), 0.2)">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <h3 className="text-2xl font-bold">{stats.total_members}</h3>
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="w-full bg-card border-border" spotlightColor="rgba(var(--primary), 0.2)">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <h3 className="text-2xl font-bold">{stats.total_members}</h3>
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="w-full bg-card border-border" spotlightColor="rgba(var(--primary), 0.2)">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Male Members</p>
                  <h3 className="text-2xl font-bold">{stats.by_gender['male'] || 0}</h3>
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="w-full bg-card border-border" spotlightColor="rgba(var(--primary), 0.2)">
            <div className="relative p-6 z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Living Abroad</p>
                  <h3 className="text-2xl font-bold">{stats.lives_abroad || 0}</h3>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Breakdown by Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(stats.by_type).map(([type, count]) => (
            <div key={type} className="bg-muted/30 rounded-lg p-3 border flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">{type}</span>
              <span className="text-sm font-bold bg-background px-2 py-1 rounded shadow-sm">{count}</span>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between pb-4 border-b">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl font-bold text-foreground">Party Members</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage and filter party members database
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <a href="/party-members-upload/template" className="inline-flex">
                <Button variant="outline" className="w-full lg:w-auto">
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
              <Button variant="outline" className="w-full lg:w-auto" onClick={() => importInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload / Update
              </Button>
              <a href={buildExportUrl('excel')} className="inline-flex">
                <Button variant="outline" className="w-full lg:w-auto">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </a>
              <a href={buildExportUrl('pdf')} className="inline-flex">
                <Button variant="outline" className="w-full lg:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </a>
              <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full lg:w-auto">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <form onSubmit={handleSendEmail}>
                    <DialogHeader>
                      <DialogTitle>Send Custom Email</DialogTitle>
                      <DialogDescription>
                        This email will be sent to <strong>{partyMembers.total}</strong> filtered members.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={emailData.subject}
                          onChange={(e) => setEmailData('subject', e.target.value)}
                          placeholder="Enter email subject"
                          required
                        />
                        {emailErrors.subject && <p className="text-xs text-destructive">{emailErrors.subject}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={emailData.content}
                          onChange={(e) => setEmailData('content', e.target.value)}
                          placeholder="Write your email content here..."
                          rows={10}
                          required
                        />
                        {emailErrors.content && <p className="text-xs text-destructive">{emailErrors.content}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="attachment">Attachment (Optional)</Label>
                        <Input
                          id="attachment"
                          type="file"
                          onChange={(e) => setEmailData('attachment', e.target.files ? e.target.files[0] : null)}
                          className="cursor-pointer"
                        />
                        <p className="text-[10px] text-muted-foreground">Max size: 10MB. Supports images, PDF, and documents.</p>
                        {emailErrors.attachment && <p className="text-xs text-destructive">{emailErrors.attachment}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={sendingEmail}>
                        {sendingEmail ? 'Sending...' : 'Send Email'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Link href="/party-members/recycle">
                <Button variant="outline" className="w-full lg:w-auto">
                  <Archive className="mr-2 h-4 w-4" />
                  Recycle
                </Button>
              </Link>
              <Link href={create().url}>
                <Button className="w-full lg:w-auto shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Member
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {/* Province Filter */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground ml-1">Province</span>
              <Select
                value={filterValues.province_id}
                onValueChange={(val) => handleFilterChange('province_id', val)}
                disabled={filterValues.lives_abroad === 'yes'}
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
                disabled={filterValues.province_id === 'all' || filterValues.lives_abroad === 'yes'}
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

            {/* Ward Filter */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground ml-1">Ward No.</span>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Ward..."
                  value={filterValues.ward_number}
                  onChange={(e) => handleFilterChange('ward_number', e.target.value)}
                  disabled={filterValues.lives_abroad === 'yes'}
                  className="w-full"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground ml-1">Member Type</span>
              <Select
                value={filterValues.party_member_type_id}
                onValueChange={(val) => handleFilterChange('party_member_type_id', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {memberTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lives Abroad Filter */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground ml-1">Living Status</span>
              <Select
                value={filterValues.lives_abroad}
                onValueChange={(val) => handleFilterChange('lives_abroad', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="no">Lives in Nepal</SelectItem>
                  <SelectItem value="yes">Lives Abroad</SelectItem>
                </SelectContent>
              </Select>
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
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {partyMembers.data.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No members found</h3>
              <p className="text-muted-foreground mt-1 mb-6">
                Try adjusting your filters or search criteria.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="p-3 pb-0">
                <ListSelectionToolbar
                  selectedCount={selection.selectedCount}
                  totalCount={partyMembers.data.length}
                  allSelected={selection.allSelected}
                  onToggleAll={selection.toggleAll}
                  onClear={selection.clearSelection}
                  label="members"
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
              <table className="w-full">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Member Details</th>
                    <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status / Gender</th>
                    <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Location</th>
                    <th className="text-right p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {partyMembers.data.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="p-4">
                        <Checkbox checked={selection.selected.includes(member.id)} onCheckedChange={(checked) => selection.toggleOne(member.id, checked)} />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{member.full_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{member.email}</div>
                        <div className="text-xs text-muted-foreground">{member.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {member.party_member_type.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-sm">{member.gender}</span>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-sm text-muted-foreground">{new Date(member.date_of_birth).getFullYear()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Joined: {member.joined_nc_at ? new Date(member.joined_nc_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        {member.lives_abroad ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 uppercase tracking-tight">
                              <Globe className="h-3 w-3" />
                              Outside Nepal
                            </span>
                            <span className="text-sm font-medium">{member.country}</span>
                          </div>
                        ) : (
                          <div className="text-sm">Ward {member.ward_number}</div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={show.url(member.id)}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={edit.url(member.id)}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(member.id, member.full_name)}
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
          )}
        </div>

        {/* Pagination */}
        {partyMembers.last_page > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {partyMembers.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${link.active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : link.url
                    ? 'hover:bg-muted border border-transparent hover:border-border'
                    : 'opacity-50 cursor-not-allowed text-muted-foreground'
                  }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
