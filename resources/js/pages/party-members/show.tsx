import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { index, edit, destroy } from '@/actions/App/Http/Controllers/PartyMemberController';
import { router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Facebook, Twitter, Instagram, Linkedin, Globe, MapPin, Calendar, Briefcase, User } from 'lucide-react';

interface PartyMemberType {
  id: number;
  name: string;
  description: string | null;
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
  tole: string | null;
  permanent_province_id: number | null;
  permanent_district_id: number | null;
  permanent_municipality_id: number | null;
  permanent_ward_number: number | null;
  permanent_tole: string | null;
  is_temp_same_as_perm: boolean;
  party_member_type: PartyMemberType;
  occupation: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  address_type: string;
  lives_abroad: boolean;
  country: string | null;
  created_at: string;
}

interface Location {
  province: string;
  district: string;
  municipality: string;
}

interface Props {
  partyMember: PartyMember;
  location: Location;
  permLocation: Location;
}

export default function Show({ partyMember, location, permLocation }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Party Members', href: '/party-members' },
    { title: partyMember.full_name, href: `/party-members/${partyMember.id}` },
  ];

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${partyMember.full_name}?`)) {
      router.delete(destroy.url(partyMember.id));
    }
  };

  const hasSocialMedia = !!(
    partyMember.facebook_url ||
    partyMember.twitter_url ||
    partyMember.instagram_url ||
    partyMember.tiktok_url ||
    partyMember.linkedin_url
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={partyMember.full_name} />

      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href={index().url}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={edit.url(partyMember.id)}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-lg border bg-card p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User size={120} />
            </div>
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold uppercase border-4 border-primary/5">
              {partyMember.full_name.charAt(0)}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-3xl font-bold">{partyMember.full_name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {partyMember.party_member_type.name}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {partyMember.joined_nc_at ? new Date(partyMember.joined_nc_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="rounded-lg border bg-card p-6 h-full">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h2>
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between border-b border-muted py-1">
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-sm font-semibold">{partyMember.phone}</dd>
                </div>
                <div className="flex justify-between border-b border-muted py-1">
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm font-semibold">{partyMember.email}</dd>
                </div>
                <div className="flex justify-between border-b border-muted py-1">
                  <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                  <dd className="text-sm font-semibold capitalize">{partyMember.gender}</dd>
                </div>
                <div className="flex justify-between border-b border-muted py-1">
                  <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                  <dd className="text-sm font-semibold">{new Date(partyMember.date_of_birth).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between border-b border-muted py-1">
                  <dt className="text-sm font-medium text-muted-foreground">Occupation</dt>
                  <dd className="text-sm font-semibold">{partyMember.occupation || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            {/* Social Media & Extra */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6 h-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Social Media Profiles
                </h2>
                {hasSocialMedia ? (
                  <div className="grid grid-cols-2 gap-3">
                    {partyMember.facebook_url && (
                      <a href={partyMember.facebook_url} target="_blank" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted text-[#1877F2]">
                        <Facebook className="h-5 w-5" /><span className="text-xs font-medium text-foreground">Facebook</span>
                      </a>
                    )}
                    {partyMember.twitter_url && (
                      <a href={partyMember.twitter_url} target="_blank" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted text-foreground">
                        <Twitter className="h-5 w-5" /><span className="text-xs font-medium text-foreground">X (Twitter)</span>
                      </a>
                    )}
                    {partyMember.instagram_url && (
                      <a href={partyMember.instagram_url} target="_blank" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted text-[#E4405F]">
                        <Instagram className="h-5 w-5" /><span className="text-xs font-medium text-foreground">Instagram</span>
                      </a>
                    )}
                    {partyMember.tiktok_url && (
                      <a href={partyMember.tiktok_url} target="_blank" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted text-foreground">
                        <Globe className="h-5 w-5" /><span className="text-xs font-medium text-foreground">TikTok</span>
                      </a>
                    )}
                    {partyMember.linkedin_url && (
                      <a href={partyMember.linkedin_url} target="_blank" className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted text-[#0A66C2]">
                        <Linkedin className="h-5 w-5" /><span className="text-xs font-medium text-foreground">LinkedIn</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">No social media links provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permanent Address */}
            <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold">Permanent Address</h2>
              </div>
              <dl className="space-y-3">
                <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Province</dt><dd className="font-medium">{permLocation.province}</dd></div>
                <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">District</dt><dd className="font-medium">{permLocation.district}</dd></div>
                <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Municipality</dt><dd className="font-medium">{permLocation.municipality}</dd></div>
                <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ward / Tole</dt><dd className="font-medium">Ward {partyMember.permanent_ward_number} {partyMember.permanent_tole ? `, ${partyMember.permanent_tole}` : ''}</dd></div>
              </dl>
            </div>

            {/* Temporary Address */}
            <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Temporary / Current Address</h2>
                </div>
                {partyMember.is_temp_same_as_perm && (
                  <span className="text-[10px] font-bold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded border">Same as Permanent</span>
                )}
              </div>
              <dl className="space-y-3">
                {partyMember.lives_abroad ? (
                  <>
                    <div className="space-y-1 flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded text-blue-700"><Globe className="h-4 w-4" /><dt className="text-xs font-bold uppercase tracking-wider">Living Outside Nepal</dt></div>
                    <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Country</dt><dd className="font-medium">{partyMember.country}</dd></div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Province</dt><dd className="font-medium">{location.province}</dd></div>
                    <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">District</dt><dd className="font-medium">{location.district}</dd></div>
                    <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Municipality</dt><dd className="font-medium">{location.municipality}</dd></div>
                    <div className="flex flex-col"><dt className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Ward / Tole</dt><dd className="font-medium">Ward {partyMember.ward_number} {partyMember.tole ? `, ${partyMember.tole}` : ''}</dd></div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
