import { Head, Link, router } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { update, index } from '@/actions/App/Http/Controllers/ResourceController';
import { ArrowLeft, Image as ImageIcon, X, Trash2 } from 'lucide-react';

interface ResourcePhoto {
  id: number;
  photo_path: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  province_id: number;
  district_id: number;
  municipality_id: number;
  ward_number: number;
  tole: string | null;
  person_name: string;
  person_email: string;
  person_phone: string;
  photos: ResourcePhoto[];
}

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
}

interface Props {
  resource: Resource;
  provinces: Province[];
  initialDistricts: District[];
  initialMunicipalities: Municipality[];
}

import { usePermission } from '@/hooks/usePermission';

export default function Edit({ resource, provinces, initialDistricts, initialMunicipalities }: Props) {
  const canView = usePermission('view-resources');
  const backHref = canView ? index().url : '/dashboard';

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resources', href: '/resources' },
    { title: 'Edit', href: `/resources/${resource.id}/edit` },
  ];

  const [selectedProvince, setSelectedProvince] = useState<string>(resource.province_id.toString());
  const [selectedDistrict, setSelectedDistrict] = useState<string>(resource.district_id.toString());
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(resource.municipality_id.toString());

  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [municipalities, setMunicipalities] = useState<Municipality[]>(initialMunicipalities);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const [previews, setPreviews] = useState<string[]>([]);
  const [provinceChanged, setProvinceChanged] = useState(false);
  const [districtChanged, setDistrictChanged] = useState(false);

  // Fetch districts when province changes
  useEffect(() => {
    if (provinceChanged && selectedProvince) {
      setLoadingDistricts(true);
      setDistricts([]);
      setSelectedDistrict('');
      setMunicipalities([]);
      setSelectedMunicipality('');

      fetch(`/api/provinces/${selectedProvince}/districts`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data);
          setLoadingDistricts(false);
        })
        .catch(() => setLoadingDistricts(false));
    }
  }, [selectedProvince, provinceChanged]);

  // Fetch municipalities when district changes
  useEffect(() => {
    if (districtChanged && selectedDistrict) {
      setLoadingMunicipalities(true);
      setMunicipalities([]);
      setSelectedMunicipality('');

      fetch(`/api/districts/${selectedDistrict}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(data);
          setLoadingMunicipalities(false);
        })
        .catch(() => setLoadingMunicipalities(false));
    }
  }, [selectedDistrict, districtChanged]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews: string[] = [];
      for (let i = 0; i < files.length; i++) {
        newPreviews.push(URL.createObjectURL(files[i]));
      }
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setProvinceChanged(true);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setDistrictChanged(true);
  };

  const deletePhoto = (photoId: number) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      router.delete(`/resource-photos/${photoId}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${resource.title}`} />

      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {canView ? 'Back to Resources' : 'Back to Dashboard'}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Resource</h1>
          <p className="text-muted-foreground mt-1">Update details for {resource.title}</p>
        </div>

        <Form {...update.form(resource.id)} className="space-y-8" encType="multipart/form-data">
          {({ errors, processing }) => (
            <>
              {/* Basic Information */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-semibold">General Information</h2>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-medium">Resource Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      defaultValue={resource.title}
                      className="bg-muted/20"
                      required
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={resource.description}
                      className="min-h-[120px] bg-muted/20"
                      required
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-semibold">Location Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="province_id" className="text-sm font-medium">Province *</Label>
                    <Select name="province_id" value={selectedProvince} onValueChange={handleProvinceChange} required>
                      <SelectTrigger id="province_id" className="bg-muted/20">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.province_id && <p className="text-sm text-destructive">{errors.province_id}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="district_id" className="text-sm font-medium">District *</Label>
                    <Select
                      name="district_id"
                      value={selectedDistrict}
                      onValueChange={handleDistrictChange}
                      disabled={loadingDistricts}
                      required
                    >
                      <SelectTrigger id="district_id" className="bg-muted/20">
                        <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select district"} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district_id && <p className="text-sm text-destructive">{errors.district_id}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="municipality_id" className="text-sm font-medium">Municipality *</Label>
                    <Select
                      name="municipality_id"
                      value={selectedMunicipality}
                      onValueChange={setSelectedMunicipality}
                      disabled={loadingMunicipalities}
                      required
                    >
                      <SelectTrigger id="municipality_id" className="bg-muted/20">
                        <SelectValue placeholder={loadingMunicipalities ? "Loading..." : "Select municipality"} />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.municipality_id && <p className="text-sm text-destructive">{errors.municipality_id}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ward_number" className="text-sm font-medium">Ward Number *</Label>
                    <Input
                      id="ward_number"
                      name="ward_number"
                      type="number"
                      min="1"
                      max="33"
                      defaultValue={resource.ward_number}
                      className="bg-muted/20"
                      required
                    />
                    {errors.ward_number && <p className="text-sm text-destructive">{errors.ward_number}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tole" className="text-sm font-medium">Tole (Optional)</Label>
                    <Input
                      id="tole"
                      name="tole"
                      type="text"
                      defaultValue={resource.tole || ''}
                      placeholder="e.g. Main Street"
                      className="bg-muted/20"
                    />
                    {errors.tole && <p className="text-sm text-destructive">{errors.tole}</p>}
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-semibold">Media (Photos)</h2>
                </div>

                <div className="grid gap-4">
                  {resource.photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                      {resource.photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border">
                          <img src={`/storage/${photo.photo_path}`} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="rounded-full shadow-lg"
                              onClick={() => deletePhoto(photo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Label htmlFor="photos" className="text-sm font-medium">Add More Photos</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="photos" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors border-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-semibold">Click to upload or drag and drop</p>
                      </div>
                      <input id="photos" name="photos[]" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {errors['photos'] && <p className="text-sm text-destructive">{errors['photos']}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-semibold">Contact Person Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="person_name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="person_name"
                      name="person_name"
                      type="text"
                      defaultValue={resource.person_name}
                      className="bg-muted/20"
                      required
                    />
                    {errors.person_name && <p className="text-sm text-destructive">{errors.person_name}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="person_email" className="text-sm font-medium">Email Address *</Label>
                    <Input
                      id="person_email"
                      name="person_email"
                      type="email"
                      defaultValue={resource.person_email}
                      className="bg-muted/20"
                      required
                    />
                    {errors.person_email && <p className="text-sm text-destructive">{errors.person_email}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="person_phone" className="text-sm font-medium">Phone Number *</Label>
                    <Input
                      id="person_phone"
                      name="person_phone"
                      type="text"
                      defaultValue={resource.person_phone}
                      className="bg-muted/20"
                      required
                    />
                    {errors.person_phone && <p className="text-sm text-destructive">{errors.person_phone}</p>}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end items-center gap-4 pt-4">
                <Link href={backHref}>
                  <Button type="button" variant="ghost" className="rounded-full px-6">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="rounded-full px-8 h-11">
                  {processing ? 'Updating Resource...' : 'Update Resource'}
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppLayout>
  );
}
