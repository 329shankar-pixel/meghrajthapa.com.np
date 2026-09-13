import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { index, update } from '@/actions/App/Http/Controllers/PartyMemberController';
import { ArrowLeft, Facebook, Twitter, Instagram, Linkedin, Globe, MapPin } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface Province { id: number; name: string; }
interface District { id: number; name: string; }
interface Municipality { id: number; name: string; category_id?: number; }
interface PartyMemberType { id: number; name: string; description: string | null; }
interface Country { code: string; name: string; }

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
  party_member_type_id: number;
  occupation: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  address_type: string;
  lives_abroad: boolean;
  country: string | null;
}

interface Props {
  partyMember: PartyMember;
  provinces: Province[];
  districts: District[];
  municipalities: Municipality[];
  permDistricts: District[];
  permMunicipalities: Municipality[];
  partyMemberTypes: PartyMemberType[];
  countries: Country[];
}



export default function Edit({
  partyMember, provinces, districts: initialDistricts, municipalities: initialMunicipalities,
  permDistricts: initialPermDistricts, permMunicipalities: initialPermMunicipalities,
  partyMemberTypes, countries
}: Props) {
  const canView = usePermission('view-members');
  const backHref = canView ? '/party-members' : '/dashboard';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Party Members', href: '/party-members' },
    { title: 'Edit', href: `/party-members/${partyMember.id}/edit` },
  ];

  // Permanent Address States
  const [permProvince, setPermProvince] = useState<string>(partyMember.permanent_province_id?.toString() || '');
  const [permDistrict, setPermDistrict] = useState<string>(partyMember.permanent_district_id?.toString() || '');
  const [permMunicipality, setPermMunicipality] = useState<string>(partyMember.permanent_municipality_id?.toString() || '');
  const [pDistricts, setPDistricts] = useState<District[]>(initialPermDistricts || []);
  const [pMunicipalities, setPMunicipalities] = useState<Municipality[]>(initialPermMunicipalities || []);

  // Temporary Address States
  const [tempProvince, setTempProvince] = useState<string>(partyMember.province_id?.toString() || '');
  const [tempDistrict, setTempDistrict] = useState<string>(partyMember.district_id?.toString() || '');
  const [tempMunicipality, setTempMunicipality] = useState<string>(partyMember.municipality_id?.toString() || '');
  const [tDistricts, setTDistricts] = useState<District[]>(initialDistricts || []);
  const [tMunicipalities, setTMunicipalities] = useState<Municipality[]>(initialMunicipalities || []);

  const [livesAbroad, setLivesAbroad] = useState(partyMember.lives_abroad);
  const [isTempSameAsPerm, setIsTempSameAsPerm] = useState(partyMember.is_temp_same_as_perm);
  const [selectedCountry, setSelectedCountry] = useState<string>(partyMember.country || '');

  // Fetch logic for Permanent
  useEffect(() => {
    if (permProvince && permProvince !== partyMember.permanent_province_id?.toString()) {
      fetch(`/api/provinces/${permProvince}/districts`).then(r => r.json()).then(setPDistricts);
    }
  }, [permProvince]);

  useEffect(() => {
    if (permDistrict && permDistrict !== partyMember.permanent_district_id?.toString()) {
      fetch(`/api/districts/${permDistrict}/municipalities`).then(r => r.json()).then(setPMunicipalities);
    }
  }, [permDistrict]);

  // Fetch logic for Temporary
  useEffect(() => {
    if (tempProvince && !isTempSameAsPerm && tempProvince !== partyMember.province_id?.toString()) {
      fetch(`/api/provinces/${tempProvince}/districts`).then(r => r.json()).then(setTDistricts);
    }
  }, [tempProvince, isTempSameAsPerm]);

  useEffect(() => {
    if (tempDistrict && !isTempSameAsPerm && tempDistrict !== partyMember.district_id?.toString()) {
      fetch(`/api/districts/${tempDistrict}/municipalities`).then(r => r.json()).then(setTMunicipalities);
    }
  }, [tempDistrict, isTempSameAsPerm]);

  // Sync logic
  useEffect(() => {
    if (isTempSameAsPerm) {
      setLivesAbroad(false);
      setTempProvince(permProvince);
      setTempDistrict(permDistrict);
      setTempMunicipality(permMunicipality);
      setTDistricts(pDistricts);
      setTMunicipalities(pMunicipalities);
    }
  }, [isTempSameAsPerm, permProvince, permDistrict, permMunicipality, pDistricts, pMunicipalities]);

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${partyMember.full_name}`} />

      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6 flex justify-between items-center">
          <Link href={backHref}><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> {canView ? 'Back to Members' : 'Back to Dashboard'}</Button></Link>
          <h1 className="text-xl font-bold">Edit Party Member</h1>
        </div>

        <Form {...update.form(partyMember.id)} className="space-y-6">
          {({ errors, processing }) => (
            <>
              <input type="hidden" name="lives_abroad" value={livesAbroad ? '1' : '0'} />
              <input type="hidden" name="is_temp_same_as_perm" value={isTempSameAsPerm ? '1' : '0'} />

              {/* Personal */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" name="full_name" defaultValue={partyMember.full_name} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" defaultValue={partyMember.phone} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" defaultValue={partyMember.email} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select name="gender" defaultValue={partyMember.gender} required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        name="occupation"
                        type="text"
                        defaultValue={partyMember.occupation || ''}
                        placeholder="Enter occupation"
                      />
                      {errors.occupation && <p className="text-sm text-destructive">{errors.occupation}</p>}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      defaultValue={formatDateForInput(partyMember.date_of_birth)}
                      required
                    />
                    {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold">Permanent Address (Nepal)</h2>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Province *</Label>
                    <Select name="permanent_province_id" value={permProvince} onValueChange={setPermProvince} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {provinces.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>District *</Label>
                    <Select name="permanent_district_id" value={permDistrict} onValueChange={setPermDistrict} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pDistricts.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Municipality *</Label>
                    <Select name="permanent_municipality_id" value={permMunicipality} onValueChange={setPermMunicipality} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pMunicipalities.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Ward Number *</Label>
                      <Input name="permanent_ward_number" type="number" defaultValue={partyMember.permanent_ward_number || ''} required />
                    </div>
                    <div className="grid gap-2">
                      <Label>Tole</Label>
                      <Input name="permanent_tole" defaultValue={partyMember.permanent_tole || ''} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Temporary Address Section */}
              <div className="rounded-lg border bg-card p-6 border-dashed">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Temporary / Current Address</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="same_as_perm" checked={isTempSameAsPerm} onCheckedChange={(c) => setIsTempSameAsPerm(c === true)} />
                    <Label htmlFor="same_as_perm" className="text-sm cursor-pointer">Same as Permanent</Label>
                  </div>
                </div>

                {!isTempSameAsPerm && (
                  <div className="grid gap-4 mt-4 animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/30">
                      <Checkbox id="lives_abroad" checked={livesAbroad} onCheckedChange={(c) => setLivesAbroad(c === true)} />
                      <Label htmlFor="lives_abroad" className="text-sm cursor-pointer">Lives Abroad</Label>
                    </div>
                    {livesAbroad ? (
                      <div className="grid gap-2">
                        <Label>Country *</Label>
                        <Select name="country" value={selectedCountry} onValueChange={setSelectedCountry} required>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-2">
                          <Label>Province *</Label>
                          <Select name="province_id" value={tempProvince} onValueChange={setTempProvince} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{provinces.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>District *</Label>
                          <Select name="district_id" value={tempDistrict} onValueChange={setTempDistrict} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{tDistricts.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Municipality *</Label>
                          <Select name="municipality_id" value={tempMunicipality} onValueChange={setTempMunicipality} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{tMunicipalities.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2"><Label>Ward *</Label><Input name="ward_number" type="number" defaultValue={partyMember.ward_number || ''} required /></div>
                          <div className="grid gap-2"><Label>Tole</Label><Input name="tole" defaultValue={partyMember.tole || ''} /></div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {isTempSameAsPerm && (
                  <div className="p-4 mt-2 bg-muted/20 rounded border border-dashed text-center text-sm text-muted-foreground">
                    Temporary address will be synced from permanent address.
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Social Media Links (Optional)</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook_url" className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
                    <Input id="facebook_url" name="facebook_url" type="url" defaultValue={partyMember.facebook_url || ''} placeholder="https://facebook.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="twitter_url" className="flex items-center gap-2"><Twitter className="h-4 w-4" /> X (Twitter)</Label>
                    <Input id="twitter_url" name="twitter_url" type="url" defaultValue={partyMember.twitter_url || ''} placeholder="https://x.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram_url" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label>
                    <Input id="instagram_url" name="instagram_url" type="url" defaultValue={partyMember.instagram_url || ''} placeholder="https://instagram.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tiktok_url" className="flex items-center gap-2"><Globe className="h-4 w-4" /> TikTok</Label>
                    <Input id="tiktok_url" name="tiktok_url" type="url" defaultValue={partyMember.tiktok_url || ''} placeholder="https://tiktok.com/@username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin_url" className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn</Label>
                    <Input id="linkedin_url" name="linkedin_url" type="url" defaultValue={partyMember.linkedin_url || ''} placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              </div>

              {/* Party Information */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Party Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="party_member_type_id">Member Type *</Label>
                    <Select name="party_member_type_id" defaultValue={partyMember.party_member_type_id?.toString()} required>
                      <SelectTrigger id="party_member_type_id">
                        <SelectValue placeholder="Select member type" />
                      </SelectTrigger>
                      <SelectContent>
                        {partyMemberTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="joined_nc_at">Date Joined NC (Optional)</Label>
                    <Input id="joined_nc_at" name="joined_nc_at" type="date" defaultValue={formatDateForInput(partyMember.joined_nc_at)} />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <Link href={backHref}><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppLayout>
  );
}
