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
import { store } from '@/actions/App/Http/Controllers/PartyMemberController';
import { Facebook, Twitter, Instagram, Linkedin, Globe, MapPin } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

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
  category_id: number;
}

interface PartyMemberType {
  id: number;
  name: string;
  description: string | null;
}

interface Country {
  code: string;
  name: string;
}

interface Props {
  provinces: Province[];
  partyMemberTypes: PartyMemberType[];
  countries: Country[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Party Members', href: '/party-members' },
  { title: 'Create', href: '/party-members/create' },
];

export default function Create({ provinces, partyMemberTypes, countries }: Props) {
  const canView = usePermission('view-members');
  const backHref = canView ? '/party-members' : '/dashboard';

  // Permanent Address States
  const [permProvince, setPermProvince] = useState<string>('');
  const [permDistrict, setPermDistrict] = useState<string>('');
  const [permMunicipality, setPermMunicipality] = useState<string>('');
  const [permDistricts, setPermDistricts] = useState<District[]>([]);
  const [permMunicipalities, setPermMunicipalities] = useState<Municipality[]>([]);
  const [loadingPermDistricts, setLoadingPermDistricts] = useState(false);
  const [loadingPermMunicipalities, setLoadingPermMunicipalities] = useState(false);

  // Temporary Address States
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const [livesAbroad, setLivesAbroad] = useState(false);
  const [isTempSameAsPerm, setIsTempSameAsPerm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Fetch districts when permanent province changes
  useEffect(() => {
    if (permProvince) {
      setLoadingPermDistricts(true);
      fetch(`/api/provinces/${permProvince}/districts`)
        .then(res => res.json())
        .then(data => {
          setPermDistricts(data);
          setLoadingPermDistricts(false);
        })
        .catch(() => setLoadingPermDistricts(false));
    }
  }, [permProvince]);

  // Fetch municipalities when permanent district changes
  useEffect(() => {
    if (permDistrict) {
      setLoadingPermMunicipalities(true);
      fetch(`/api/districts/${permDistrict}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setPermMunicipalities(data);
          setLoadingPermMunicipalities(false);
        })
        .catch(() => setLoadingPermMunicipalities(false));
    }
  }, [permDistrict]);

  // Fetch districts when temporary province changes
  useEffect(() => {
    if (selectedProvince && !isTempSameAsPerm) {
      setLoadingDistricts(true);
      fetch(`/api/provinces/${selectedProvince}/districts`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data);
          setLoadingDistricts(false);
        })
        .catch(() => setLoadingDistricts(false));
    }
  }, [selectedProvince, isTempSameAsPerm]);

  // Fetch municipalities when temporary district changes
  useEffect(() => {
    if (selectedDistrict && !isTempSameAsPerm) {
      setLoadingMunicipalities(true);
      fetch(`/api/districts/${selectedDistrict}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(data);
          setLoadingMunicipalities(false);
        })
        .catch(() => setLoadingMunicipalities(false));
    }
  }, [selectedDistrict, isTempSameAsPerm]);

  // Sync logic for "Same as Permanent"
  useEffect(() => {
    if (isTempSameAsPerm) {
      setLivesAbroad(false);
      setSelectedProvince(permProvince);
      setSelectedDistrict(permDistrict);
      setSelectedMunicipality(permMunicipality);
      setDistricts(permDistricts);
      setMunicipalities(permMunicipalities);
    }
  }, [isTempSameAsPerm, permProvince, permDistrict, permMunicipality, permDistricts, permMunicipalities]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Party Member" />

      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Party Member</h1>
          <p className="text-muted-foreground mt-1">Add a new member to the party</p>
        </div>

        <Form {...store.form()} className="space-y-6">
          {({ errors, processing }) => (
            <>
              {/* Hidden fields for toggles */}
              <input type="hidden" name="lives_abroad" value={livesAbroad ? '1' : '0'} />
              <input type="hidden" name="is_temp_same_as_perm" value={isTempSameAsPerm ? '1' : '0'} />

              {/* Personal Information */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter full name"
                      required
                    />
                    {errors.full_name && (
                      <p className="text-sm text-destructive">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="text"
                        placeholder="Enter phone number"
                        required
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select name="gender" required>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-destructive">{errors.gender}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        required
                      />
                      {errors.date_of_birth && (
                        <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      type="text"
                      placeholder="Enter occupation"
                    />
                    {errors.occupation && (
                      <p className="text-sm text-destructive">{errors.occupation}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permanent Address Section */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold">Permanent Address (Nepal)</h2>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="permanent_province_id">Province *</Label>
                    <Select
                      name="permanent_province_id"
                      value={permProvince}
                      onValueChange={(v) => {
                        setPermProvince(v);
                        setPermDistrict('');
                        setPermMunicipality('');
                      }}
                      required
                    >
                      <SelectTrigger id="permanent_province_id">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.permanent_province_id && (
                      <p className="text-sm text-destructive">{errors.permanent_province_id}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="permanent_district_id">District *</Label>
                    <Select
                      name="permanent_district_id"
                      value={permDistrict}
                      onValueChange={(v) => {
                        setPermDistrict(v);
                        setPermMunicipality('');
                      }}
                      disabled={!permProvince || loadingPermDistricts}
                      required
                    >
                      <SelectTrigger id="permanent_district_id">
                        <SelectValue placeholder={loadingPermDistricts ? "Loading..." : "Select district"} />
                      </SelectTrigger>
                      <SelectContent>
                        {permDistricts.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.permanent_district_id && (
                      <p className="text-sm text-destructive">{errors.permanent_district_id}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="permanent_municipality_id">Municipality *</Label>
                    <Select
                      name="permanent_municipality_id"
                      value={permMunicipality}
                      onValueChange={setPermMunicipality}
                      disabled={!permDistrict || loadingPermMunicipalities}
                      required
                    >
                      <SelectTrigger id="permanent_municipality_id">
                        <SelectValue placeholder={loadingPermMunicipalities ? "Loading..." : "Select municipality"} />
                      </SelectTrigger>
                      <SelectContent>
                        {permMunicipalities.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.permanent_municipality_id && (
                      <p className="text-sm text-destructive">{errors.permanent_municipality_id}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="permanent_ward_number">Ward Number *</Label>
                      <Input
                        id="permanent_ward_number"
                        name="permanent_ward_number"
                        type="number"
                        min="1"
                        max="33"
                        required
                      />
                      {errors.permanent_ward_number && (
                        <p className="text-sm text-destructive">{errors.permanent_ward_number}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="permanent_tole">Tole (Optional)</Label>
                      <Input
                        id="permanent_tole"
                        name="permanent_tole"
                        type="text"
                        placeholder="Enter tole name"
                      />
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
                    <Checkbox
                      id="same_as_perm"
                      checked={isTempSameAsPerm}
                      onCheckedChange={(checked) => setIsTempSameAsPerm(checked === true)}
                    />
                    <Label htmlFor="same_as_perm" className="text-sm font-medium cursor-pointer">
                      Same as Permanent
                    </Label>
                  </div>
                </div>

                {!isTempSameAsPerm && (
                  <div className="grid gap-4 mt-4 animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/30">
                      <Checkbox
                        id="lives_abroad_toggle"
                        checked={livesAbroad}
                        onCheckedChange={(checked) => setLivesAbroad(checked === true)}
                      />
                      <Label htmlFor="lives_abroad_toggle" className="text-sm cursor-pointer">
                        Lives Outside Nepal
                      </Label>
                    </div>

                    {livesAbroad ? (
                      <div className="grid gap-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          name="country"
                          value={selectedCountry}
                          onValueChange={setSelectedCountry}
                          required={livesAbroad}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries?.map((c) => (
                              <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="province_id">Province *</Label>
                          <Select
                            name="province_id"
                            value={selectedProvince}
                            onValueChange={(v) => { setSelectedProvince(v); setSelectedDistrict(''); setSelectedMunicipality(''); }}
                            required={!livesAbroad && !isTempSameAsPerm}
                          >
                            <SelectTrigger id="province_id">
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="district_id">District *</Label>
                          <Select
                            name="district_id"
                            value={selectedDistrict}
                            onValueChange={(v) => { setSelectedDistrict(v); setSelectedMunicipality(''); }}
                            disabled={!selectedProvince || loadingDistricts}
                            required={!livesAbroad && !isTempSameAsPerm}
                          >
                            <SelectTrigger id="district_id">
                              <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select district"} />
                            </SelectTrigger>
                            <SelectContent>
                              {districts.map((d) => (
                                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="municipality_id">Municipality *</Label>
                          <Select
                            name="municipality_id"
                            value={selectedMunicipality}
                            onValueChange={setSelectedMunicipality}
                            disabled={!selectedDistrict || loadingMunicipalities}
                            required={!livesAbroad && !isTempSameAsPerm}
                          >
                            <SelectTrigger id="municipality_id">
                              <SelectValue placeholder={loadingMunicipalities ? "Loading..." : "Select municipality"} />
                            </SelectTrigger>
                            <SelectContent>
                              {municipalities.map((m) => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="ward_number">Ward *</Label>
                            <Input id="ward_number" name="ward_number" type="number" min="1" max="33" required={!livesAbroad && !isTempSameAsPerm} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tole">Tole (Optional)</Label>
                            <Input id="tole" name="tole" type="text" />
                          </div>
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
                    <Input id="facebook_url" name="facebook_url" type="url" placeholder="https://facebook.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="twitter_url" className="flex items-center gap-2"><Twitter className="h-4 w-4" /> X (Twitter)</Label>
                    <Input id="twitter_url" name="twitter_url" type="url" placeholder="https://x.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram_url" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label>
                    <Input id="instagram_url" name="instagram_url" type="url" placeholder="https://instagram.com/username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tiktok_url" className="flex items-center gap-2"><Globe className="h-4 w-4" /> TikTok</Label>
                    <Input id="tiktok_url" name="tiktok_url" type="url" placeholder="https://tiktok.com/@username" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="linkedin_url" className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn</Label>
                    <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/username" />
                  </div>
                </div>
              </div>

              {/* Party Information */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Party Information</h2>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="party_member_type_id">Member Type *</Label>
                    <Select name="party_member_type_id" required>
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
                    <Input id="joined_nc_at" name="joined_nc_at" type="date" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={backHref}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create Party Member'}</Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppLayout>
  );
}
