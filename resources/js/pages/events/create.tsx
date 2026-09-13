import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichEditor } from '@/components/rich-editor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { store } from '@/actions/App/Http/Controllers/EventController';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, MapPin, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Events', href: '/events' },
  { title: 'Create', href: '/events/create' },
];

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

interface Props {
  provinces: Province[];
}

import { usePermission } from '@/hooks/usePermission';

export default function Create({ provinces }: Props) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const canView = usePermission('view-events');
  const backHref = canView ? '/events' : '/dashboard';

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    slug: '',
    content: '',
    event_date: '',
    location: '',
    province_id: '',
    district_id: '',
    municipality_id: '',
    ward_number: '',
    tole: '',
    cover_image: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.cover_image) {
      URL.revokeObjectURL(data.cover_image as any); // Cleanup old preview
    }
    setData('cover_image', e.target.files ? e.target.files[0] : null);
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugManuallyEdited) {
      const generatedSlug = data.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      setData('slug', generatedSlug);
    }
  }, [data.title, isSlugManuallyEdited]);

  // Fetch districts when province changes
  useEffect(() => {
    if (data.province_id) {
      fetch(`/api/provinces/${data.province_id}/districts`)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(() => setDistricts([]));
      setData(prev => ({ ...prev, district_id: '', municipality_id: '' }));
    } else {
      setDistricts([]);
    }
  }, [data.province_id]);

  // Fetch municipalities when district changes
  useEffect(() => {
    if (data.district_id) {
      fetch(`/api/districts/${data.district_id}/municipalities`)
        .then(res => res.json())
        .then(data => setMunicipalities(data))
        .catch(() => setMunicipalities([]));
      setData(prev => ({ ...prev, municipality_id: '' }));
    } else {
      setMunicipalities([]);
    }
  }, [data.district_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(store.url(), {
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Event" />

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
              <p className="text-muted-foreground">Schedule a new event or gathering</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Save Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about the event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                  <InputError message={errors.title} />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <label htmlFor="cover_image" className="block w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    {data.cover_image ? (
                      <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md border">
                        <img
                          src={URL.createObjectURL(data.cover_image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white font-medium flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm font-medium">Click to upload cover image</span>
                        <span className="text-xs">PNG, JPG, WEBP (Max 2MB)</span>
                      </div>
                    )}
                    <input
                      id="cover_image"
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                  <InputError message={errors.cover_image} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">Slug</Label>
                    {!isSlugManuallyEdited && (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold text-blue-500">Auto-generated</span>
                    )}
                  </div>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => {
                      setData('slug', e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="event-url-slug"
                  />
                  <InputError message={errors.slug} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichEditor
                    value={data.content}
                    onChange={val => setData('content', val)}
                    placeholder="Describe the event..."
                  />
                  <InputError message={errors.content} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When the event takes place.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Date and Time *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="event_date"
                      type="datetime-local"
                      className="pl-10"
                      value={data.event_date}
                      onChange={e => setData('event_date', e.target.value)}
                      required
                    />
                  </div>
                  <InputError message={errors.event_date} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Where the event takes place.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Specific Venue / Place Name</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="location"
                      className="pl-10"
                      value={data.location}
                      onChange={e => setData('location', e.target.value)}
                      placeholder="e.g. City Hall, Conference Center"
                    />
                  </div>
                  <InputError message={errors.location} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province_id">Province</Label>
                  <Select
                    value={data.province_id}
                    onValueChange={(val) => setData('province_id', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.province_id} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district_id">District</Label>
                  <Select
                    value={data.district_id}
                    onValueChange={(val) => setData('district_id', val)}
                    disabled={!data.province_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.district_id} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality_id">Municipality</Label>
                  <Select
                    value={data.municipality_id}
                    onValueChange={(val) => setData('municipality_id', val)}
                    disabled={!data.district_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.municipality_id} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ward_number">Ward No.</Label>
                    <Input
                      id="ward_number"
                      type="number"
                      value={data.ward_number}
                      onChange={e => setData('ward_number', e.target.value)}
                      placeholder="Ward"
                    />
                    <InputError message={errors.ward_number} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tole">Tole</Label>
                    <Input
                      id="tole"
                      value={data.tole}
                      onChange={e => setData('tole', e.target.value)}
                      placeholder="Tole"
                    />
                    <InputError message={errors.tole} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppLayout >
  );
}
