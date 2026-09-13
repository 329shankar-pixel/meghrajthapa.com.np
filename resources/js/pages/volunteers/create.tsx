import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { store } from '@/actions/App/Http/Controllers/VolunteerController';
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

interface Event {
  id: number;
  title: string;
}

interface Props {
  event: Event;
  provinces: Province[];
}

export default function Create({ event, provinces }: Props) {
  if (!event) return null;

  const canView = usePermission('view-events');
  const backHref = canView ? `/events/${event.id}` : '/dashboard';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Events', href: '/events' },
    { title: event.title, href: `/events/${event.id}` },
    { title: 'Add Volunteer', href: `/volunteers/create?event_id=${event.id}` },
  ];

  const { data, setData, post, processing, errors } = useForm({
    event_id: event.id,
    full_name: '',
    phone: '',
    email: '',
    province_id: '',
    district_id: '',
    municipality_id: '',
    ward_number: '',
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  // Fetch districts when province changes
  useEffect(() => {
    if (data.province_id) {
      setLoadingDistricts(true);
      setDistricts([]);
      setData('district_id', '');
      setMunicipalities([]);
      setData('municipality_id', '');

      fetch(`/api/provinces/${data.province_id}/districts`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data);
          setLoadingDistricts(false)
        })
        .catch(() => setLoadingDistricts(false));
    }
  }, [data.province_id]);

  // Fetch municipalities when district changes
  useEffect(() => {
    if (data.district_id) {
      setLoadingMunicipalities(true);
      setMunicipalities([]);
      setData('municipality_id', '');

      fetch(`/api/districts/${data.district_id}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(data);
          setLoadingMunicipalities(false)
        })
        .catch(() => setLoadingMunicipalities(false));
    }
  }, [data.district_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(store().url);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Add Volunteer to ${event.title}`} />

      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Add Volunteer</h1>
          <p className="text-muted-foreground mt-1">Assign a volunteer to <strong>{event.title}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Volunteer Detail</h2>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={data.full_name}
                  onChange={(e) => setData('full_name', e.target.value)}
                  placeholder="Enter volunteer name"
                  required
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Demography Information</h2>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="province_id">Province *</Label>
                <Select
                  value={data.province_id}
                  onValueChange={(v) => setData('province_id', v)}
                >
                  <SelectTrigger id="province_id">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces && Array.isArray(provinces) && provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province_id && (
                  <p className="text-sm text-destructive">{errors.province_id}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="district_id">District *</Label>
                <Select
                  value={data.district_id}
                  onValueChange={(v) => setData('district_id', v)}
                  disabled={!data.province_id || loadingDistricts}
                >
                  <SelectTrigger id="district_id">
                    <SelectValue placeholder={
                      loadingDistricts ? "Loading..." :
                        !data.province_id ? "Select province first" : "Select district"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id.toString()}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district_id && (
                  <p className="text-sm text-destructive">{errors.district_id}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="municipality_id">Municipality *</Label>
                <Select
                  value={data.municipality_id}
                  onValueChange={(v) => setData('municipality_id', v)}
                  disabled={!data.district_id || loadingMunicipalities}
                >
                  <SelectTrigger id="municipality_id">
                    <SelectValue placeholder={
                      loadingMunicipalities ? "Loading..." :
                        !data.district_id ? "Select district first" : "Select municipality"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((municipality) => (
                      <SelectItem key={municipality.id} value={municipality.id.toString()}>
                        {municipality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipality_id && (
                  <p className="text-sm text-destructive">{errors.municipality_id}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ward_number">Ward Number *</Label>
                <Input
                  id="ward_number"
                  type="number"
                  min="1"
                  max="33"
                  value={data.ward_number}
                  onChange={(e) => setData('ward_number', e.target.value)}
                  placeholder="Enter ward number"
                  required
                />
                {errors.ward_number && (
                  <p className="text-sm text-destructive">{errors.ward_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href={backHref}>
              <Button
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={processing}
            >
              {processing ? 'Adding...' : 'Add Volunteer'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
