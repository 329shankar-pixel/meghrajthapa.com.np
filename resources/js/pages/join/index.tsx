import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/public-layout';
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
import { store } from '@/actions/App/Http/Controllers/JoinController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, MapPin, Globe, Briefcase, User, Zap, Star, ArrowRight, ShieldCheck, Heart, Home, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

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
  leader: {
    social_links: Record<string, string> | null;
  } | null;
  locationScope?: {
    province_id?: string;
    district_id?: string;
    municipality_id?: string;
  };
}

export default function JoinIndex({ provinces, partyMemberTypes, countries, leader, locationScope = {} }: Props) {
  const [success, setSuccess] = useState(false);

  // Permanent Address States
  const [permProvince, setPermProvince] = useState<string>(locationScope.province_id || '');
  const [permDistrict, setPermDistrict] = useState<string>(locationScope.district_id || '');
  const [permMunicipality, setPermMunicipality] = useState<string>(locationScope.municipality_id || '');
  const [permDistricts, setPermDistricts] = useState<District[]>([]);
  const [permMunicipalities, setPermMunicipalities] = useState<Municipality[]>([]);
  const [loadingPermDistricts, setLoadingPermDistricts] = useState(false);
  const [loadingPermMunicipalities, setLoadingPermMunicipalities] = useState(false);

  // Temporary Address States
  const [tempProvince, setTempProvince] = useState<string>(locationScope.province_id || '');
  const [tempDistrict, setTempDistrict] = useState<string>(locationScope.district_id || '');
  const [tempMunicipality, setTempMunicipality] = useState<string>(locationScope.municipality_id || '');
  const [tDistricts, setTDistricts] = useState<District[]>([]);
  const [tMunicipalities, setTMunicipalities] = useState<Municipality[]>([]);
  const [loadingTDistricts, setLoadingTDistricts] = useState(false);
  const [loadingTMunicipalities, setLoadingTMunicipalities] = useState(false);

  const [livesAbroad, setLivesAbroad] = useState(false);
  const [isTempSameAsPerm, setIsTempSameAsPerm] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    phone: '',
    email: '',
    occupation: '',
    gender: '',
    date_of_birth: '',
    party_member_type_id: '',
    joined_nc_at: '',
    permanent_province_id: locationScope.province_id || '',
    permanent_district_id: locationScope.district_id || '',
    permanent_municipality_id: locationScope.municipality_id || '',
    permanent_ward_number: '',
    permanent_tole: '',
    province_id: locationScope.province_id || '',
    district_id: locationScope.district_id || '',
    municipality_id: locationScope.municipality_id || '',
    ward_number: '',
    tole: '',
    lives_abroad: false,
    is_temp_same_as_perm: false,
    country: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    tiktok_url: '',
    linkedin_url: '',
  });

  const scopedProvinces = locationScope.province_id
    ? provinces.filter((province) => province.id.toString() === locationScope.province_id)
    : provinces;
  const provinceLocked = Boolean(locationScope.province_id);
  const districtLocked = Boolean(locationScope.district_id);
  const municipalityLocked = Boolean(locationScope.municipality_id);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Handle Permanent Address API calls
  useEffect(() => {
    if (permProvince) {
      setLoadingPermDistricts(true);
      if (!districtLocked) setPermDistrict('');
      if (!municipalityLocked) setPermMunicipality('');
      fetch(`/api/provinces/${permProvince}/districts`).then(r => r.json()).then(d => { setPermDistricts(districtLocked ? d.filter((item: District) => item.id.toString() === locationScope.district_id) : d); setLoadingPermDistricts(false); });
      setData('permanent_province_id', permProvince);
      if (!districtLocked) setData('permanent_district_id', '');
      if (!municipalityLocked) setData('permanent_municipality_id', '');
    }
  }, [permProvince, districtLocked, municipalityLocked, locationScope.district_id]);

  useEffect(() => {
    if (permDistrict) {
      setLoadingPermMunicipalities(true);
      if (!municipalityLocked) setPermMunicipality('');
      fetch(`/api/districts/${permDistrict}/municipalities`).then(r => r.json()).then(d => { setPermMunicipalities(municipalityLocked ? d.filter((item: Municipality) => item.id.toString() === locationScope.municipality_id) : d); setLoadingPermMunicipalities(false); });
      setData('permanent_district_id', permDistrict);
      if (!municipalityLocked) setData('permanent_municipality_id', '');
    }
  }, [permDistrict, municipalityLocked, locationScope.municipality_id]);

  // Handle Temporary Address API calls
  useEffect(() => {
    if (tempProvince && !isTempSameAsPerm) {
      setLoadingTDistricts(true);
      if (!districtLocked) setTempDistrict('');
      if (!municipalityLocked) setTempMunicipality('');
      fetch(`/api/provinces/${tempProvince}/districts`).then(r => r.json()).then(d => { setTDistricts(districtLocked ? d.filter((item: District) => item.id.toString() === locationScope.district_id) : d); setLoadingTDistricts(false); });
      setData('province_id', tempProvince);
      if (!districtLocked) setData('district_id', '');
      if (!municipalityLocked) setData('municipality_id', '');
    }
  }, [tempProvince, isTempSameAsPerm, districtLocked, municipalityLocked, locationScope.district_id]);

  useEffect(() => {
    if (tempDistrict && !isTempSameAsPerm) {
      setLoadingTMunicipalities(true);
      if (!municipalityLocked) setTempMunicipality('');
      fetch(`/api/districts/${tempDistrict}/municipalities`).then(r => r.json()).then(d => { setTMunicipalities(municipalityLocked ? d.filter((item: Municipality) => item.id.toString() === locationScope.municipality_id) : d); setLoadingTMunicipalities(false); });
      setData('district_id', tempDistrict);
      if (!municipalityLocked) setData('municipality_id', '');
    }
  }, [tempDistrict, isTempSameAsPerm, municipalityLocked, locationScope.municipality_id]);

  // Sync logic
  useEffect(() => {
    if (isTempSameAsPerm) {
      setData({
        ...data,
        is_temp_same_as_perm: true,
        lives_abroad: false,
        province_id: permProvince,
        district_id: permDistrict,
        municipality_id: permMunicipality,
        ward_number: data.permanent_ward_number,
        tole: data.permanent_tole,
      });
      setTempProvince(permProvince);
      setTempDistrict(permDistrict);
      setTempMunicipality(permMunicipality);
      setTDistricts(permDistricts);
      setTMunicipalities(permMunicipalities);
    } else {
      setData('is_temp_same_as_perm', false);
    }
  }, [isTempSameAsPerm, permProvince, permDistrict, permMunicipality, data.permanent_ward_number, data.permanent_tole]);

  useEffect(() => {
    setData('lives_abroad', livesAbroad);
    if (livesAbroad) {
      setIsTempSameAsPerm(false);
      setTempProvince('');
      setTempDistrict('');
      setTempMunicipality('');
      setData({
        ...data,
        lives_abroad: true,
        is_temp_same_as_perm: false,
        province_id: '',
        district_id: '',
        municipality_id: '',
        ward_number: '',
        tole: '',
      });
    } else {
      setData('country', '');
    }
  }, [livesAbroad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(store.url(), {
      onSuccess: () => {
        setSuccess(true);
        reset();
      }
    });
  };

  if (success) {
    return (
      <PublicLayout socialLinks={leader?.social_links ?? undefined}>
        <Head title="Join Our Movement - Mission Confirmed" />
        <div className="container max-w-2xl py-32 mx-auto px-6">
          <Card className="rounded-[4rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
            <CardContent className="p-16 text-center space-y-8 animate-fade-in-up">
              <div className="w-28 h-28 bg-[var(--political-green)] rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-900/20 rotate-12">
                <ShieldCheck className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-black text-[var(--political-green)] tracking-tight leading-tight">Identity Verified & Mission Confirmed</h2>
              <p className="text-xl text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                Your application to join the movement has been successfully transmitted. Our coordination team will establish contact within 48 hours to begin your integration process.
              </p>
              <div className="pt-10">
                <Link href="/">
                  <button className="bg-gray-900 dark:bg-white dark:text-gray-950 text-white px-12 py-6 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-[var(--political-red)] dark:hover:bg-gray-200 transition-all flex items-center gap-4 mx-auto">
                    PROCEED TO DASHBOARD
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Join Our Movement - Enrollment Portal" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <Heart className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Collective Action</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight leading-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">
                  <span className="text-[var(--political-red)]">Step Into</span> the
                </span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200">
                  New Era
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Your commitment is the engine of change. Complete your profile below to join our national network of progress.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <Card className="rounded-[4rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
              <CardHeader className="p-10 md:p-16 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-[var(--political-red)] border border-gray-100 dark:border-gray-700">
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <CardTitle className="text-4xl font-black text-[var(--political-green)] tracking-tight">Enrollment Form</CardTitle>
                  </div>
                  <CardDescription className="text-lg font-medium text-gray-400 dark:text-gray-500">Formalize your dedication to our shared mission.</CardDescription>
                </div>

                <div className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-2">Member Support</p>
                    <p className="font-bold text-[var(--political-green)] leading-none text-xl">+977-XXXXXXXX</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-[var(--political-green)]">
                    <Phone className="w-6 h-6" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-10 md:p-16">
                <form onSubmit={handleSubmit} className="space-y-16">

                  {/* Section 1: Personal Intelligence */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--political-green)] uppercase tracking-widest">Personal Identification</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Full Identity Name *</Label>
                        <Input
                          value={data.full_name}
                          onChange={e => setData('full_name', e.target.value)}
                          placeholder="Full Name As Per Documentation"
                          className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 transition-all font-bold text-gray-900 dark:text-white"
                          required
                        />
                        {errors.full_name && <p className="text-[var(--political-red)] text-[10px] font-bold ml-4">{errors.full_name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Phone Number *</Label>
                        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="98XXXXXXXX" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" required />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Email Address *</Label>
                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="identity@server.com" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" required />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Gender *</Label>
                        <Select onValueChange={(val) => setData('gender', val)} required>
                          <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white"><SelectValue placeholder="Identify Gender" /></SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="male" className="dark:text-white dark:focus:bg-gray-700">Male</SelectItem>
                            <SelectItem value="female" className="dark:text-white dark:focus:bg-gray-700">Female</SelectItem>
                            <SelectItem value="other" className="dark:text-white dark:focus:bg-gray-700">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Chronological Birth Date *</Label>
                        <Input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" required />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Primary Occupation</Label>
                        <Input value={data.occupation} onChange={e => setData('occupation', e.target.value)} placeholder="Professional Status..." className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Permanent Base */}
                  <div className="space-y-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--political-green)] uppercase tracking-widest">Permanent Geographical Base</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Select value={permProvince} onValueChange={setPermProvince} disabled={provinceLocked} required>
                        <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white"><SelectValue placeholder="Province *" /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{scopedProvinces.map(p => <SelectItem key={p.id} value={p.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{p.name}</SelectItem>)}</SelectContent>
                      </Select>

                      <Select value={permDistrict} onValueChange={setPermDistrict} disabled={!permProvince || loadingPermDistricts || districtLocked} required>
                        <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white"><SelectValue placeholder={loadingPermDistricts ? "Loading..." : "District *"} /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{permDistricts.map(d => <SelectItem key={d.id} value={d.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{d.name}</SelectItem>)}</SelectContent>
                      </Select>

                      <Select value={permMunicipality} onValueChange={(v) => { setPermMunicipality(v); setData('permanent_municipality_id', v); }} disabled={!permDistrict || loadingPermMunicipalities || municipalityLocked} required>
                        <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white"><SelectValue placeholder={loadingPermMunicipalities ? "Loading..." : "Municipality *"} /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{permMunicipalities.map(m => <SelectItem key={m.id} value={m.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{m.name}</SelectItem>)}</SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" min="1" max="33" value={data.permanent_ward_number} onChange={e => setData('permanent_ward_number', e.target.value)} placeholder="Ward *" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white" required />
                        <Input value={data.permanent_tole} onChange={e => setData('permanent_tole', e.target.value)} placeholder="Tole/Village" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Deployment Location */}
                  <div className="space-y-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                          <Home className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-black text-[var(--political-green)] uppercase tracking-widest">Active Deployment Location</h3>
                      </div>

                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Checkbox id="same_as_perm" checked={isTempSameAsPerm} onCheckedChange={(c) => setIsTempSameAsPerm(c === true)} className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-[var(--political-red)]" />
                        <Label htmlFor="same_as_perm" className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 cursor-pointer">Synchronize with Permanent Base</Label>
                      </div>
                    </div>

                    {!isTempSameAsPerm && (
                      <div className="grid gap-8 animate-in fade-in duration-500">
                        <div className="flex items-center space-x-3 p-6 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                          <Checkbox id="lives_abroad" checked={livesAbroad} onCheckedChange={(c) => setLivesAbroad(c === true)} className="data-[state=checked]:bg-[var(--political-green)]" />
                          <Label htmlFor="lives_abroad" className="text-sm font-black uppercase tracking-widest text-[var(--political-green)] dark:text-white cursor-pointer flex items-center gap-3">
                            <Globe className="h-5 w-5 text-[var(--political-green)]" /> Currently Stationed Outside Nepal
                          </Label>
                        </div>

                        {livesAbroad ? (
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Host Country *</Label>
                            <Select onValueChange={(v) => setData('country', v)} required>
                              <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white"><SelectValue placeholder="Select Global Territory" /></SelectTrigger>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{countries?.map(c => <SelectItem key={c.code} value={c.name} className="dark:text-white dark:focus:bg-gray-700">{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Select value={tempProvince} onValueChange={setTempProvince} disabled={provinceLocked} required={!isTempSameAsPerm && !livesAbroad}>
                              <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white"><SelectValue placeholder="Temp Province *" /></SelectTrigger>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{scopedProvinces.map(p => <SelectItem key={p.id} value={p.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={tempDistrict} onValueChange={setTempDistrict} disabled={!tempProvince || loadingTDistricts || districtLocked} required={!isTempSameAsPerm && !livesAbroad}>
                              <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white"><SelectValue placeholder={loadingTDistricts ? "Loading..." : "Temp District *"} /></SelectTrigger>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{tDistricts.map(d => <SelectItem key={d.id} value={d.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{d.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={tempMunicipality} onValueChange={(v) => { setTempMunicipality(v); setData('municipality_id', v); }} disabled={!tempDistrict || loadingTMunicipalities || municipalityLocked} required={!isTempSameAsPerm && !livesAbroad}>
                              <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white"><SelectValue placeholder={loadingTMunicipalities ? "Loading..." : "Temp Municipality *"} /></SelectTrigger>
                              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">{tMunicipalities.map(m => <SelectItem key={m.id} value={m.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{m.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="grid grid-cols-2 gap-4">
                              <Input type="number" min="1" max="33" value={data.ward_number} onChange={e => setData('ward_number', e.target.value)} placeholder="Ward *" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white" required={!isTempSameAsPerm && !livesAbroad} />
                              <Input value={data.tole} onChange={e => setData('tole', e.target.value)} placeholder="Tole/Village" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Social Network Links */}
                  <div className="space-y-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--political-green)] uppercase tracking-widest">Social Media Links</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4 flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
                        <Input type="url" value={data.facebook_url} onChange={e => setData('facebook_url', e.target.value)} placeholder="https://facebook.com/username" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4 flex items-center gap-2"><Twitter className="h-4 w-4" /> X / Twitter</Label>
                        <Input type="url" value={data.twitter_url} onChange={e => setData('twitter_url', e.target.value)} placeholder="https://x.com/username" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4 flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label>
                        <Input type="url" value={data.instagram_url} onChange={e => setData('instagram_url', e.target.value)} placeholder="https://instagram.com/username" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4 flex items-center gap-2"><Globe className="h-4 w-4" /> TikTok</Label>
                        <Input type="url" value={data.tiktok_url} onChange={e => setData('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@username" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4 flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn</Label>
                        <Input type="url" value={data.linkedin_url} onChange={e => setData('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/username" className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 transition-all font-bold dark:text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Movement Intelligence */}
                  <div className="space-y-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--political-green)] uppercase tracking-widest">Movement Integration Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Membership Class *</Label>
                        <Select onValueChange={(val) => setData('party_member_type_id', val)} required>
                          <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white"><SelectValue placeholder="Enrollment Level" /></SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {partyMemberTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Initial Contact Date (Optional)</Label>
                        <Input type="date" value={data.joined_nc_at} onChange={e => setData('joined_nc_at', e.target.value)} className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 font-bold dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-8 bg-gray-900 dark:bg-white dark:text-gray-950 text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-gray-900/10 hover:bg-[var(--political-red)] dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group/btn"
                    >
                      {processing ? <Loader2 className="w-10 h-10 animate-spin" /> : (
                        <>
                          COMMIT TO SERVICE
                          <ArrowRight className="w-8 h-8 group-hover/btn:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-[0.3em] mt-8 leading-loose animate-pulse">
                      Identity Transmission Protocols Active // Secure Connection Established
                    </p>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <style>{`
        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .fade-in-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </PublicLayout>
  );
}
