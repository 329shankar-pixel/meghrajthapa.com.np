import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Activity,
    BarChart3,
    Bookmark,
    Calendar,
    Camera,
    FileText,
    Filter,
    Mail,
    MapPin,
    Newspaper,
    Shield,
    Star,
    Tags,
    User,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

interface Stats {
    partyMembers: number;
    partyMemberTypes: number;
    events: number;
    volunteers: number;
    activities: number;
    news: number;
    blog: number;
    resources: number;
    bookmarkedProjects: number;
    importantProjects: number;
    teamMembers: number;
    users: number;
    sentEmails: number;
}

interface StatPoint {
    id?: number;
    name: string;
    count: number;
}

interface PartyMember {
    id: number;
    full_name: string;
    email: string;
    created_at: string;
}

interface Project {
    id: number;
    title: string;
    urgency?: string | null;
    is_bookmarked: boolean;
    is_important: boolean;
    created_at: string;
}

interface EventItem {
    id: number;
    title: string;
    event_date: string;
    location?: string | null;
}

interface FilterOption {
    id: number;
    name: string;
}

interface Props {
    stats: Stats;
    filteredMemberCount: number;
    districtStats: StatPoint[];
    municipalityStats: StatPoint[];
    genderStats: StatPoint[];
    memberTypeStats: StatPoint[];
    projectUrgencyStats: StatPoint[];
    emailStats: {
        queued: number;
        sent: number;
        errors: number;
        recipients: number;
    };
    recentMembers: PartyMember[];
    recentProjects: Project[];
    upcomingEvents: EventItem[];
    filters: {
        province_id: string | null;
        district_id: string | null;
        municipality_id: string | null;
    };
    filterOptions: {
        provinces: FilterOption[];
        districts: FilterOption[];
        municipalities: FilterOption[];
    };
    noAccess?: boolean;
}

function MetricCard({ title, value, icon: Icon, tone = 'primary' }: { title: string; value: number; icon: any; tone?: string }) {
    return (
        <div className="group overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
                    <p className="mt-3 text-3xl font-black">{value.toLocaleString()}</p>
                </div>
                <div className={`rounded-2xl p-3 ${tone === 'red' ? 'bg-red-500/10 text-red-600' : tone === 'green' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function BarList({ title, items, tone = 'bg-primary' }: { title: string; items: StatPoint[]; tone?: string }) {
    const max = Math.max(...items.map((item) => item.count), 1);

    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-black">{title}</h2>
            <div className="mt-5 space-y-4">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available.</p>
                ) : (
                    items.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="truncate font-bold">{item.name}</span>
                                <span className="font-black">{item.count}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max((item.count / max) * 100, 6)}%` }} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function Dashboard({
    stats,
    filteredMemberCount,
    districtStats,
    municipalityStats,
    genderStats,
    memberTypeStats,
    projectUrgencyStats,
    emailStats,
    recentMembers,
    recentProjects,
    upcomingEvents,
    filters,
    filterOptions,
    noAccess,
}: Props) {
    const { props } = usePage<any>();
    const partyName = props.settings?.party_name || 'Campaign';
    const [localFilters, setLocalFilters] = useState({
        province_id: filters.province_id || '',
        district_id: filters.district_id || '',
        municipality_id: filters.municipality_id || '',
    });

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        if (key === 'province_id') {
            newFilters.district_id = '';
            newFilters.municipality_id = '';
        }
        if (key === 'district_id') {
            newFilters.municipality_id = '';
        }
        setLocalFilters(newFilters);

        const queryParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([filterKey, filterValue]) => {
            if (filterValue && filterValue !== 'all') queryParams.set(filterKey, filterValue);
        });
        router.get(`/dashboard?${queryParams.toString()}`, {}, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setLocalFilters({ province_id: '', district_id: '', municipality_id: '' });
        router.get('/dashboard', {}, { preserveState: true, preserveScroll: true });
    };

    if (noAccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex min-h-[70vh] items-center justify-center p-6">
                    <div className="max-w-2xl rounded-[2rem] border bg-card p-10 text-center shadow-sm">
                        <Shield className="mx-auto h-12 w-12 text-primary" />
                        <h1 className="mt-6 text-4xl font-black">Welcome to {partyName}</h1>
                        <p className="mt-3 text-muted-foreground">Your account is active. Ask an administrator for dashboard analytics access if you need it.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const hasActiveFilters = localFilters.province_id || localFilters.district_id || localFilters.municipality_id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-green-950 via-green-900 to-red-900 p-6 text-white shadow-xl md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                                <BarChart3 className="h-4 w-4" />
                                Campaign Command Dashboard
                            </div>
                            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{partyName}</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 md:text-base">
                                Unified analytics for members, content, projects, events, volunteers, and campaign communication.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-white/10 p-4 text-center">
                                <p className="text-3xl font-black">{filteredMemberCount}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Filtered Members</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 text-center">
                                <p className="text-3xl font-black">{stats.resources}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Projects</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 text-center">
                                <p className="text-3xl font-black">{emailStats.recipients}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-white/65">Email Targets</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <MetricCard title="Members" value={stats.partyMembers} icon={Users} tone="green" />
                    <MetricCard title="Volunteers" value={stats.volunteers} icon={User} />
                    <MetricCard title="Events" value={stats.events} icon={Calendar} tone="red" />
                    <MetricCard title="Projects" value={stats.resources} icon={FileText} tone="green" />
                    <MetricCard title="Sent Emails" value={stats.sentEmails} icon={Mail} />
                    <MetricCard title="Users" value={stats.users} icon={Shield} tone="red" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard title="News" value={stats.news} icon={Newspaper} />
                    <MetricCard title="Blog" value={stats.blog} icon={FileText} tone="green" />
                    <MetricCard title="Activities" value={stats.activities} icon={Camera} tone="red" />
                    <MetricCard title="Member Types" value={stats.partyMemberTypes} icon={Tags} />
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-black">
                                <Filter className="h-5 w-5 text-primary" />
                                Location Filter
                            </h2>
                            <p className="text-sm text-muted-foreground">Filter member analytics by official Nepal location data.</p>
                        </div>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-full">
                                <X className="mr-2 h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Province</Label>
                            <Select value={localFilters.province_id} onValueChange={(value) => handleFilterChange('province_id', value)}>
                                <SelectTrigger><SelectValue placeholder="All Provinces" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Provinces</SelectItem>
                                    {filterOptions.provinces.map((province) => <SelectItem key={province.id} value={province.id.toString()}>{province.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>District</Label>
                            <Select value={localFilters.district_id} onValueChange={(value) => handleFilterChange('district_id', value)} disabled={!localFilters.province_id}>
                                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Districts</SelectItem>
                                    {filterOptions.districts.map((district) => <SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Municipality</Label>
                            <Select value={localFilters.municipality_id} onValueChange={(value) => handleFilterChange('municipality_id', value)} disabled={!localFilters.district_id}>
                                <SelectTrigger><SelectValue placeholder="All Municipalities" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Municipalities</SelectItem>
                                    {filterOptions.municipalities.map((municipality) => <SelectItem key={municipality.id} value={municipality.id.toString()}>{municipality.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <BarList title="Members by District" items={districtStats} tone="bg-green-600" />
                    <BarList title="Members by Municipality" items={municipalityStats} tone="bg-red-600" />
                    <BarList title="Members by Type" items={memberTypeStats} tone="bg-primary" />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <BarList title="Gender Distribution" items={genderStats} tone="bg-green-600" />
                    <BarList title="Project Urgency" items={projectUrgencyStats} tone="bg-red-600" />
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-black">Email Delivery</h2>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {[
                                ['Queued', emailStats.queued],
                                ['Sent', emailStats.sent],
                                ['Errors', emailStats.errors],
                                ['Recipients', emailStats.recipients],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl bg-muted/50 p-4">
                                    <p className="text-2xl font-black">{Number(value).toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-black">Recent Members</h2>
                        <div className="mt-4 space-y-3">
                            {recentMembers.map((member) => (
                                <div key={member.id} className="rounded-xl bg-muted/40 p-3">
                                    <p className="font-bold">{member.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-black">Recent Projects</h2>
                        <div className="mt-4 space-y-3">
                            {recentProjects.map((project) => (
                                <Link key={project.id} href={`/resources/${project.id}`} className="flex items-center justify-between rounded-xl bg-muted/40 p-3 transition hover:bg-muted">
                                    <span className="font-bold">{project.title}</span>
                                    <span className="flex items-center gap-2">
                                        {project.is_important && <Star className="h-4 w-4 fill-amber-400 text-amber-500" />}
                                        {project.is_bookmarked && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="text-lg font-black">Upcoming Events</h2>
                        <div className="mt-4 space-y-3">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming events.</p>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <Link key={event.id} href={`/events/${event.id}`} className="block rounded-xl bg-muted/40 p-3 transition hover:bg-muted">
                                        <p className="font-bold">{event.title}</p>
                                        <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {event.location || 'Location pending'} - {new Date(event.event_date).toLocaleString()}
                                        </p>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
