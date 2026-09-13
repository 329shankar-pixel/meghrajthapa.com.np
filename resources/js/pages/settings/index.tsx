import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler } from 'react';
import { useEffect, useState } from 'react';
import { Loader2, Settings, Layout, Type } from 'lucide-react';
import InputError from '@/components/input-error';
import { update } from '@/actions/App/Http/Controllers/Settings/SiteSettingController';

interface Props {
  settings: Record<string, string>;
  locationOptions: {
    provinces: { id: number; name: string }[];
    districts: { id: number; name: string }[];
    municipalities: { id: number; name: string; category_id?: number }[];
    scope: {
      province_id: string;
      district_id: string;
      municipality_id: string;
    };
  };
}

export default function SiteSettings({ settings, locationOptions }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Site Configuration', href: '#' },
  ];

  const { data, setData, post, processing, errors } = useForm({
    party_name: settings.party_name || '',
    campaign_label: settings.campaign_label || '',
    campaign_notification_email: settings.campaign_notification_email || '',
    campaign_whatsapp_number: settings.campaign_whatsapp_number || '',
    campaign_office_address: settings.campaign_office_address || '',
    homepage_eyebrow: settings.homepage_eyebrow || 'Nepali Congress Digital Headquarters',
    homepage_primary_message: settings.homepage_primary_message || '',
    homepage_secondary_message: settings.homepage_secondary_message || '',
    homepage_meta_title: settings.homepage_meta_title || '',
    homepage_primary_cta_label: settings.homepage_primary_cta_label || 'Join the Movement',
    homepage_secondary_cta_label: settings.homepage_secondary_cta_label || 'Submit Local Project',
    homepage_whatsapp_label: settings.homepage_whatsapp_label || 'WhatsApp',
    homepage_hero_badge_label: settings.homepage_hero_badge_label || 'Ready to Serve',
    homepage_vision_label: settings.homepage_vision_label || 'Vision & Priorities',
    homepage_vision_title: settings.homepage_vision_title || 'A clear agenda for honest leadership and local progress.',
    homepage_vision_description: settings.homepage_vision_description || 'This campaign is built around the issues followers raise every day: jobs, roads, education, health, dignity, and accountable service.',
    homepage_biography_label: settings.homepage_biography_label || 'Biography + Public Record',
    homepage_biography_title: settings.homepage_biography_title || 'Leadership followers can trust.',
    homepage_biography_button_label: settings.homepage_biography_button_label || 'Full Biography',
    homepage_timeline_empty_title: settings.homepage_timeline_empty_title || 'A record of democratic service, public accountability, and local development work',
    homepage_news_label: settings.homepage_news_label || 'Newsroom',
    homepage_news_title: settings.homepage_news_title || 'Updates built for public trust.',
    homepage_news_empty_text: settings.homepage_news_empty_text || 'Publish news updates from the dashboard to populate this newsroom.',
    homepage_action_label: settings.homepage_action_label || 'Supporter Action Desk',
    homepage_action_title: settings.homepage_action_title || 'Take part in the campaign today.',
    homepage_action_1_title: settings.homepage_action_1_title || 'Register as supporter',
    homepage_action_1_text: settings.homepage_action_1_text || 'Add your voice, your skills, and your local strength to the movement.',
    homepage_action_2_title: settings.homepage_action_2_title || 'Volunteer for events',
    homepage_action_2_text: settings.homepage_action_2_text || 'Join programs, meet neighbors, and help carry the message to every community.',
    homepage_action_3_title: settings.homepage_action_3_title || 'Submit community project',
    homepage_action_3_text: settings.homepage_action_3_text || 'Tell us what your ward needs so the campaign can follow up with purpose.',
    homepage_activities_label: settings.homepage_activities_label || 'Achievements + Field Work',
    homepage_activities_title: settings.homepage_activities_title || 'Evidence from the ground.',
    homepage_activities_button_label: settings.homepage_activities_button_label || 'View Activities',
    homepage_activities_empty_text: settings.homepage_activities_empty_text || 'Add activities and galleries to turn this section into a visual campaign record.',
    homepage_programs_label: settings.homepage_programs_label || 'Public Programs',
    homepage_programs_title: settings.homepage_programs_title || 'Meet us, question us, and move forward with us.',
    homepage_programs_button_label: settings.homepage_programs_button_label || 'View Events',
    homepage_events_column_title: settings.homepage_events_column_title || 'Upcoming Events',
    homepage_articles_column_title: settings.homepage_articles_column_title || 'Articles',
    homepage_media_label: settings.homepage_media_label || 'Media Gallery',
    homepage_media_title: settings.homepage_media_title || 'Photos and videos made to travel.',
    homepage_photos_button_label: settings.homepage_photos_button_label || 'Photos',
    homepage_videos_button_label: settings.homepage_videos_button_label || 'Videos',
    hero_title: settings.hero_title || '',
    hero_subtitle: settings.hero_subtitle || '',
    hero_description: settings.hero_description || '',
    hero_image: null as File | null,
    unity_title: settings.unity_title || '',
    unity_subtitle: settings.unity_subtitle || '',
    unity_description: settings.unity_description || '',
    unity_image: null as File | null,
    experience_years: settings.experience_years || '25',
    experience_label_1: settings.experience_label_1 || 'Years Active',
    experience_years_2: settings.experience_years_2 || '100',
    experience_label_2: settings.experience_label_2 || 'Policy Impacts',
    marquee_keywords: settings.marquee_keywords || 'Prosperity, Unity, Progress',
    cta_title: settings.cta_title || 'Be the Change You Want to See.',
    cta_description: settings.cta_description || 'Our strength comes from the people. Sign up today to volunteer, donate, or simply stay updated with our progress.',
    unity_label: settings.unity_label || 'Unity',
    unity_quote: settings.unity_quote || 'Unity is our greatest strength.',
    legacy_number: settings.legacy_number || '25',
    legacy_label: settings.legacy_label || 'Years of Leadership',
    news_label: settings.news_label || 'Stay Informed',
    news_title: settings.news_title || 'Latest Movement',
    marquee_name: settings.marquee_name || '',
    site_tagline: settings.site_tagline || 'Movement for Progress',
    favicon: null as File | null,
    site_logo: null as File | null,
    party_flag: null as File | null,
    election_symbol: null as File | null,
    campaign_issue_1_title: settings.campaign_issue_1_title || '',
    campaign_issue_1_description: settings.campaign_issue_1_description || '',
    campaign_issue_2_title: settings.campaign_issue_2_title || '',
    campaign_issue_2_description: settings.campaign_issue_2_description || '',
    campaign_issue_3_title: settings.campaign_issue_3_title || '',
    campaign_issue_3_description: settings.campaign_issue_3_description || '',
    campaign_issue_4_title: settings.campaign_issue_4_title || '',
    campaign_issue_4_description: settings.campaign_issue_4_description || '',
    location_scope_province_id: locationOptions.scope.province_id || '',
    location_scope_district_id: locationOptions.scope.district_id || '',
    location_scope_municipality_id: locationOptions.scope.municipality_id || '',
  });

  const [districts, setDistricts] = useState(locationOptions.districts || []);
  const [municipalities, setMunicipalities] = useState(locationOptions.municipalities || []);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  useEffect(() => {
    if (!data.location_scope_province_id) {
      setDistricts([]);
      setMunicipalities([]);
      setData('location_scope_district_id', '');
      setData('location_scope_municipality_id', '');
      return;
    }

    setLoadingDistricts(true);
    fetch(`/api/provinces/${data.location_scope_province_id}/districts`)
      .then((response) => response.json())
      .then((items) => setDistricts(items))
      .finally(() => setLoadingDistricts(false));
  }, [data.location_scope_province_id]);

  useEffect(() => {
    if (!data.location_scope_district_id) {
      setMunicipalities([]);
      setData('location_scope_municipality_id', '');
      return;
    }

    setLoadingMunicipalities(true);
    fetch(`/api/districts/${data.location_scope_district_id}/municipalities`)
      .then((response) => response.json())
      .then((items) => setMunicipalities(items))
      .finally(() => setLoadingMunicipalities(false));
  }, [data.location_scope_district_id]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(update.url(), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Site Settings" />

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 items-start justify-between flex flex-col md:flex-row gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Homepage & Branding
            </h1>
            <p className="text-muted-foreground">
              Manage global branding and all homepage sections dynamically.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-10">
          {/* General Branding */}
          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">General Branding</h2>
            </div>

            <div className="grid gap-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid w-full gap-2">
                  <Label htmlFor="party_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Party / Movement Name</Label>
                  <Input
                    id="party_name"
                    value={data.party_name}
                    onChange={(e) => setData('party_name', e.target.value)}
                    placeholder="Enter Party Name"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.party_name} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="site_tagline" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Site Tagline / Slogan</Label>
                  <Input
                    id="site_tagline"
                    value={data.site_tagline}
                    onChange={(e) => setData('site_tagline', e.target.value)}
                    placeholder="e.g., Movement for Progress"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.site_tagline} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="campaign_label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Footer Campaign Label</Label>
                  <Input
                    id="campaign_label"
                    value={data.campaign_label}
                    onChange={(e) => setData('campaign_label', e.target.value)}
                    placeholder="e.g., Nepali Congress Campaign"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.campaign_label} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="marquee_name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Marquee Display Name (Optional)</Label>
                  <Input
                    id="marquee_name"
                    value={data.marquee_name}
                    onChange={(e) => setData('marquee_name', e.target.value)}
                    placeholder="e.g., Lee Adams"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.marquee_name} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="favicon" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Site Favicon (Tab Icon)</Label>
                  <Input
                    id="favicon"
                    type="file"
                    onChange={(e) => setData('favicon', e.target.files?.[0] || null)}
                    className="h-12 rounded-xl pt-2"
                  />
                  {settings.favicon && (
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.favicon}</p>
                  )}
                  <InputError message={errors.favicon} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="site_logo" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Administration Logo</Label>
                  <Input
                    id="site_logo"
                    type="file"
                    onChange={(e) => setData('site_logo', e.target.files?.[0] || null)}
                    className="h-12 rounded-xl pt-2"
                  />
                  {settings.site_logo && (
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.site_logo}</p>
                  )}
                  <InputError message={errors.site_logo} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="party_flag" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Party Flag</Label>
                  <Input
                    id="party_flag"
                    type="file"
                    onChange={(e) => setData('party_flag', e.target.files?.[0] || null)}
                    className="h-12 rounded-xl pt-2"
                  />
                  {settings.party_flag && (
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.party_flag}</p>
                  )}
                  <InputError message={errors.party_flag} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="election_symbol" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Election Symbol</Label>
                  <Input
                    id="election_symbol"
                    type="file"
                    onChange={(e) => setData('election_symbol', e.target.files?.[0] || null)}
                    className="h-12 rounded-xl pt-2"
                  />
                  {settings.election_symbol && (
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.election_symbol}</p>
                  )}
                  <InputError message={errors.election_symbol} />
                </div>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="marquee_keywords" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Marquee Keywords (Comma separated)</Label>
                <Input
                  id="marquee_keywords"
                  value={data.marquee_keywords}
                  onChange={(e) => setData('marquee_keywords', e.target.value)}
                  placeholder="e.g., Prosperity, Unity, Progress"
                  className="h-12 rounded-xl"
                />
                <InputError message={errors.marquee_keywords} />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="grid w-full gap-2">
                  <Label htmlFor="campaign_notification_email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Notification Email</Label>
                  <Input
                    id="campaign_notification_email"
                    value={data.campaign_notification_email}
                    onChange={(e) => setData('campaign_notification_email', e.target.value)}
                    placeholder="campaign@example.com"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.campaign_notification_email} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="campaign_whatsapp_number" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</Label>
                  <Input
                    id="campaign_whatsapp_number"
                    value={data.campaign_whatsapp_number}
                    onChange={(e) => setData('campaign_whatsapp_number', e.target.value)}
                    placeholder="98XXXXXXXX or 97798XXXXXXXX"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.campaign_whatsapp_number} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="campaign_office_address" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Campaign Office</Label>
                  <Input
                    id="campaign_office_address"
                    value={data.campaign_office_address}
                    onChange={(e) => setData('campaign_office_address', e.target.value)}
                    placeholder="Campaign office address"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.campaign_office_address} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Public Form Location Scope</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Leave blank to show all Nepal. Choose province, district, or municipality to lock public form address fields to that area.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="location_scope_province_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Allowed Province</Label>
                  <select
                    id="location_scope_province_id"
                    value={data.location_scope_province_id}
                    onChange={(event) => {
                      setData({
                        ...data,
                        location_scope_province_id: event.target.value,
                        location_scope_district_id: '',
                        location_scope_municipality_id: '',
                      });
                    }}
                    className="h-12 rounded-xl border bg-background px-3 text-sm font-bold"
                  >
                    <option value="">All provinces</option>
                    {locationOptions.provinces.map((province) => (
                      <option key={province.id} value={province.id}>{province.name}</option>
                    ))}
                  </select>
                  <InputError message={errors.location_scope_province_id} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location_scope_district_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Allowed District</Label>
                  <select
                    id="location_scope_district_id"
                    value={data.location_scope_district_id}
                    onChange={(event) => {
                      setData({
                        ...data,
                        location_scope_district_id: event.target.value,
                        location_scope_municipality_id: '',
                      });
                    }}
                    disabled={!data.location_scope_province_id || loadingDistricts}
                    className="h-12 rounded-xl border bg-background px-3 text-sm font-bold disabled:opacity-60"
                  >
                    <option value="">{loadingDistricts ? 'Loading districts...' : 'All districts in selected province'}</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                  <InputError message={errors.location_scope_district_id} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location_scope_municipality_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Allowed Municipality</Label>
                  <select
                    id="location_scope_municipality_id"
                    value={data.location_scope_municipality_id}
                    onChange={(event) => setData('location_scope_municipality_id', event.target.value)}
                    disabled={!data.location_scope_district_id || loadingMunicipalities}
                    className="h-12 rounded-xl border bg-background px-3 text-sm font-bold disabled:opacity-60"
                  >
                    <option value="">{loadingMunicipalities ? 'Loading municipalities...' : 'All municipalities in selected district'}</option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
                    ))}
                  </select>
                  <InputError message={errors.location_scope_municipality_id} />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Type className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Homepage Hero Content</h2>
            </div>

            <div className="grid gap-8 relative z-10">
              <div className="grid w-full gap-2">
                <Label htmlFor="homepage_eyebrow" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Homepage Eyebrow</Label>
                <Input
                  id="homepage_eyebrow"
                  value={data.homepage_eyebrow}
                  onChange={(e) => setData('homepage_eyebrow', e.target.value)}
                  placeholder="e.g., Nepali Congress Digital Headquarters"
                  className="h-12 rounded-xl"
                />
                <InputError message={errors.homepage_eyebrow} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="hero_title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Title (Main)</Label>
                <Input
                  id="hero_title"
                  value={data.hero_title}
                  onChange={(e) => setData('hero_title', e.target.value)}
                  placeholder="e.g., Visionary Leadership"
                  className="h-12 rounded-xl"
                />
                <InputError message={errors.hero_title} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="hero_subtitle" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Subtitle (Animated Reveal)</Label>
                <Input
                  id="hero_subtitle"
                  value={data.hero_subtitle}
                  onChange={(e) => setData('hero_subtitle', e.target.value)}
                  placeholder="e.g., Leading with Vision & Integrity"
                  className="h-12 rounded-xl"
                />
                <InputError message={errors.hero_subtitle} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="hero_description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Description</Label>
                <Textarea
                  id="hero_description"
                  value={data.hero_description}
                  onChange={(e) => setData('hero_description', e.target.value)}
                  placeholder="Enter deep vision description..."
                  className="min-h-[120px] rounded-[1.5rem] p-4"
                />
                <InputError message={errors.hero_description} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="homepage_primary_message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Primary Campaign Message</Label>
                <Textarea
                  id="homepage_primary_message"
                  value={data.homepage_primary_message}
                  onChange={(e) => setData('homepage_primary_message', e.target.value)}
                  placeholder="Clear value statement for the homepage..."
                  className="min-h-[100px] rounded-[1.5rem] p-4"
                />
                <InputError message={errors.homepage_primary_message} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="homepage_secondary_message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Secondary Campaign Message</Label>
                <Textarea
                  id="homepage_secondary_message"
                  value={data.homepage_secondary_message}
                  onChange={(e) => setData('homepage_secondary_message', e.target.value)}
                  placeholder="Additional platform or campaign explanation..."
                  className="min-h-[100px] rounded-[1.5rem] p-4"
                />
                <InputError message={errors.homepage_secondary_message} />
              </div>

              <div className="grid gap-5 rounded-2xl border bg-background/50 p-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Homepage Section Copy</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['homepage_meta_title', 'Browser / SEO Title'],
                    ['homepage_primary_cta_label', 'Primary Button Label'],
                    ['homepage_secondary_cta_label', 'Secondary Button Label'],
                    ['homepage_whatsapp_label', 'WhatsApp Button Label'],
                    ['homepage_hero_badge_label', 'Hero Badge Label'],
                    ['homepage_vision_label', 'Vision Section Label'],
                    ['homepage_vision_title', 'Vision Section Title'],
                    ['homepage_biography_label', 'Biography Section Label'],
                    ['homepage_biography_title', 'Biography Section Title'],
                    ['homepage_biography_button_label', 'Biography Button Label'],
                    ['homepage_news_label', 'News Section Label'],
                    ['homepage_news_title', 'News Section Title'],
                    ['homepage_action_label', 'Action Box Label'],
                    ['homepage_action_title', 'Action Box Title'],
                    ['homepage_activities_label', 'Activities Section Label'],
                    ['homepage_activities_title', 'Activities Section Title'],
                    ['homepage_activities_button_label', 'Activities Button Label'],
                    ['homepage_programs_label', 'Programs Section Label'],
                    ['homepage_programs_title', 'Programs Section Title'],
                    ['homepage_programs_button_label', 'Programs Button Label'],
                    ['homepage_events_column_title', 'Events Column Title'],
                    ['homepage_articles_column_title', 'Articles Column Title'],
                    ['homepage_media_label', 'Media Section Label'],
                    ['homepage_media_title', 'Media Section Title'],
                    ['homepage_photos_button_label', 'Photos Button Label'],
                    ['homepage_videos_button_label', 'Videos Button Label'],
                  ].map(([key, label]) => (
                    <div key={key} className="grid gap-2">
                      <Label htmlFor={key} className="ml-1 text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
                      <Input
                        id={key}
                        value={data[key as keyof typeof data] as string}
                        onChange={(event) => setData(key as keyof typeof data, event.target.value)}
                        className="h-12 rounded-xl"
                      />
                      <InputError message={errors[key as keyof typeof errors]} />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4">
                  {[
                    ['homepage_vision_description', 'Vision Section Description'],
                    ['homepage_timeline_empty_title', 'Fallback Timeline Text'],
                    ['homepage_news_empty_text', 'Empty News Text'],
                    ['homepage_action_1_title', 'Action 1 Title'],
                    ['homepage_action_1_text', 'Action 1 Text'],
                    ['homepage_action_2_title', 'Action 2 Title'],
                    ['homepage_action_2_text', 'Action 2 Text'],
                    ['homepage_action_3_title', 'Action 3 Title'],
                    ['homepage_action_3_text', 'Action 3 Text'],
                    ['homepage_activities_empty_text', 'Empty Activities Text'],
                  ].map(([key, label]) => (
                    <div key={key} className="grid gap-2">
                      <Label htmlFor={key} className="ml-1 text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</Label>
                      <Textarea
                        id={key}
                        value={data[key as keyof typeof data] as string}
                        onChange={(event) => setData(key as keyof typeof data, event.target.value)}
                        className="min-h-[84px] rounded-xl"
                      />
                      <InputError message={errors[key as keyof typeof errors]} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="hero_image" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Image</Label>
                  <Input
                    id="hero_image"
                    type="file"
                    onChange={(e) => setData('hero_image', e.target.files?.[0] || null)}
                    className="h-12 rounded-xl pt-2"
                  />
                  {settings.hero_image && (
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.hero_image}</p>
                  )}
                  <InputError message={errors.hero_image} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="experience_years" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Legacy Count 1 (e.g. 25)</Label>
                  <Input
                    id="experience_years"
                    value={data.experience_years}
                    onChange={(e) => setData('experience_years', e.target.value)}
                    placeholder="e.g., 25"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.experience_years} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="experience_years_2" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Legacy Count 2 (e.g. 100)</Label>
                  <Input
                    id="experience_years_2"
                    value={data.experience_years_2}
                    onChange={(e) => setData('experience_years_2', e.target.value)}
                    placeholder="e.g., 100"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.experience_years_2} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="experience_label_1" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Legacy Label 1</Label>
                  <Input
                    id="experience_label_1"
                    value={data.experience_label_1}
                    onChange={(e) => setData('experience_label_1', e.target.value)}
                    placeholder="e.g., Years Active"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.experience_label_1} />
                </div>

                <div className="grid w-full gap-2">
                  <Label htmlFor="experience_label_2" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Legacy Label 2</Label>
                  <Input
                    id="experience_label_2"
                    value={data.experience_label_2}
                    onChange={(e) => setData('experience_label_2', e.target.value)}
                    placeholder="e.g., Policy Impacts"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.experience_label_2} />
                </div>
              </div>
            </div>
          </div>

          {/* Unity Section */}
          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Unity & Legacy Section</h2>
            </div>

            <div className="grid gap-8 relative z-10">
              <div className="grid w-full gap-2">
                <Label htmlFor="unity_title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unity Section Title</Label>
                <Input
                  id="unity_title"
                  value={data.unity_title}
                  onChange={(e) => setData('unity_title', e.target.value)}
                  placeholder="e.g., Building a Foundation..."
                  className="h-12 rounded-xl"
                />
                <InputError message={errors.unity_title} />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="unity_description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unity Section Description</Label>
                <Textarea
                  id="unity_description"
                  value={data.unity_description}
                  onChange={(e) => setData('unity_description', e.target.value)}
                  placeholder="Enter Unity description..."
                  className="min-h-[100px] rounded-xl"
                />
                <InputError message={errors.unity_description} />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="unity_label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unity Sub-label</Label>
                  <Input
                    id="unity_label"
                    value={data.unity_label}
                    onChange={(e) => setData('unity_label', e.target.value)}
                    placeholder="e.g., Unity"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.unity_label} />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="unity_quote" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unity Quote (Overlay)</Label>
                  <Input
                    id="unity_quote"
                    value={data.unity_quote}
                    onChange={(e) => setData('unity_quote', e.target.value)}
                    placeholder="e.g., Unity is our greatest strength."
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.unity_quote} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="legacy_number" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Badge Number (e.g. 25)</Label>
                  <Input
                    id="legacy_number"
                    value={data.legacy_number}
                    onChange={(e) => setData('legacy_number', e.target.value)}
                    placeholder="e.g., 25"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.legacy_number} />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="legacy_label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Badge Label (e.g. Years of Leadership)</Label>
                  <Input
                    id="legacy_label"
                    value={data.legacy_label}
                    onChange={(e) => setData('legacy_label', e.target.value)}
                    placeholder="e.g., Years of Leadership"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.legacy_label} />
                </div>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="unity_image" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Unity Section Image</Label>
                <Input
                  id="unity_image"
                  type="file"
                  onChange={(e) => setData('unity_image', e.target.files?.[0] || null)}
                  className="h-12 rounded-xl pt-2"
                />
                {settings.unity_image && (
                  <p className="text-[10px] text-muted-foreground mt-1 ml-1">Current: {settings.unity_image}</p>
                )}
                <InputError message={errors.unity_image} />
              </div>
            </div>
          </div>

          {/* Campaign Platform */}
          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Campaign Platform Cards</h2>
            </div>

            <div className="grid gap-8 relative z-10">
              {[1, 2, 3, 4].map((number) => (
                <div key={number} className="grid gap-4 rounded-2xl border bg-background/50 p-5 md:grid-cols-[0.55fr_1fr]">
                  <div className="grid w-full gap-2">
                    <Label htmlFor={`campaign_issue_${number}_title`} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Issue {number} Title</Label>
                    <Input
                      id={`campaign_issue_${number}_title`}
                      value={data[`campaign_issue_${number}_title` as keyof typeof data] as string}
                      onChange={(e) => setData(`campaign_issue_${number}_title` as keyof typeof data, e.target.value)}
                      placeholder="e.g., Clean Governance"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="grid w-full gap-2">
                    <Label htmlFor={`campaign_issue_${number}_description`} className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Issue {number} Description</Label>
                    <Textarea
                      id={`campaign_issue_${number}_description`}
                      value={data[`campaign_issue_${number}_description` as keyof typeof data] as string}
                      onChange={(e) => setData(`campaign_issue_${number}_description` as keyof typeof data, e.target.value)}
                      placeholder="Describe this issue priority..."
                      className="min-h-[90px] rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Section */}
          <div className="space-y-6 rounded-[2.5rem] border bg-card p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">News Section Content</h2>
            </div>

            <div className="grid gap-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="grid w-full gap-2">
                  <Label htmlFor="news_label" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">News Sub-label</Label>
                  <Input
                    id="news_label"
                    value={data.news_label}
                    onChange={(e) => setData('news_label', e.target.value)}
                    placeholder="e.g., Stay Informed"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.news_label} />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="news_title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">News Title</Label>
                  <Input
                    id="news_title"
                    value={data.news_title}
                    onChange={(e) => setData('news_title', e.target.value)}
                    placeholder="e.g., Latest Movement"
                    className="h-12 rounded-xl"
                  />
                  <InputError message={errors.news_title} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" size="lg" disabled={processing} className="rounded-2xl px-12 h-14 font-bold shadow-xl shadow-primary/20">
              {processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Save All Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
