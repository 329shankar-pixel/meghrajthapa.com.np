import { Head, useForm, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Calendar, MapPin, Clock, Users, ChevronLeft, Check, Loader2, Hand, Star, ArrowRight, Info, Heart, CalendarDays, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaWhatsapp, FaViber } from 'react-icons/fa6';

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
  content: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cover_image: string | null;
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  event: Event;
  provinces: Province[];
  leader: Leader | null;
  locationScope?: {
    province_id?: string;
    district_id?: string;
    municipality_id?: string;
  };
}

export default function EventShow({ event, provinces, leader, locationScope = {} }: Props) {
  const { flash } = usePage<{ flash: { success?: string } }>().props;
  const [selectedProvince, setSelectedProvince] = useState<string>(locationScope.province_id || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(locationScope.district_id || '');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(locationScope.municipality_id || '');
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    full_name: '',
    phone: '',
    email: '',
    province_id: locationScope.province_id || '',
    district_id: locationScope.district_id || '',
    municipality_id: locationScope.municipality_id || '',
    ward_number: '',
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

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      setLoadingDistricts(true);
      setDistricts([]);
      if (!districtLocked) setSelectedDistrict('');
      setMunicipalities([]);
      if (!municipalityLocked) setSelectedMunicipality('');
      setData('province_id', selectedProvince);
      if (!districtLocked) setData('district_id', '');
      if (!municipalityLocked) setData('municipality_id', '');

      fetch(`/api/provinces/${selectedProvince}/districts`)
        .then(res => res.json())
        .then(data => {
          setDistricts(districtLocked ? data.filter((item: District) => item.id.toString() === locationScope.district_id) : data);
          setLoadingDistricts(false);
        })
        .catch(() => setLoadingDistricts(false));
    }
  }, [selectedProvince, districtLocked, municipalityLocked, locationScope.district_id]);

  // Fetch municipalities when district changes
  useEffect(() => {
    if (selectedDistrict) {
      setLoadingMunicipalities(true);
      setMunicipalities([]);
      if (!municipalityLocked) setSelectedMunicipality('');
      setData('district_id', selectedDistrict);
      if (!municipalityLocked) setData('municipality_id', '');

      fetch(`/api/districts/${selectedDistrict}/municipalities`)
        .then(res => res.json())
        .then(data => {
          setMunicipalities(municipalityLocked ? data.filter((item: Municipality) => item.id.toString() === locationScope.municipality_id) : data);
          setLoadingMunicipalities(false);
        })
        .catch(() => setLoadingMunicipalities(false));
    }
  }, [selectedDistrict, municipalityLocked, locationScope.municipality_id]);

  useEffect(() => {
    if (selectedMunicipality) {
      setData('municipality_id', selectedMunicipality);
    }
  }, [selectedMunicipality]);

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/program/events/${event.id}/volunteer`, {
      onSuccess: () => {
        reset();
        setSelectedProvince(locationScope.province_id || '');
        setSelectedDistrict(locationScope.district_id || '');
        setSelectedMunicipality(locationScope.municipality_id || '');
      },
    });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://x.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'viber':
        shareUrl = `viber://forward?text=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast here
  };

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title={`${event.title} - Event Detail`}>
        <meta name="description" content={event.content?.substring(0, 160) || `Join us for ${event.title}`} />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          {event.cover_image && (
            <img
              src={`/storage/${event.cover_image}`}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover opacity-[0.03] dark:opacity-[0.05] grayscale"
            />
          )}
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 text-center">
            <Link
              href="/program/events"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-[var(--political-red)] transition-all group mb-4"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to All Events
            </Link>

            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <CalendarDays className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Upcoming Gathering</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-[var(--political-green)] tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap justify-center gap-6 pt-4 animate-fade-in-up delay-500">
              <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Calendar className="w-5 h-5 text-[var(--political-red)]" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-1">Date</p>
                  <p className="font-bold text-[var(--political-green)] leading-none">
                    {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <MapPin className="w-5 h-5 text-[var(--political-green)]" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-1">Venue</p>
                    <p className="font-bold text-[var(--political-green)] leading-none truncate max-w-[200px]">{event.location}</p>
                  </div>
                </div>
              )}
              {(event.start_time || event.end_time) && (
                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <Clock className="w-5 h-5 text-[var(--political-red)]" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-1">Time</p>
                    <p className="font-bold text-[var(--political-green)] leading-none">
                      {formatTime(event.start_time)}{event.end_time && ` — ${formatTime(event.end_time)}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

              {/* Event Details */}
              <div className="lg:col-span-7 space-y-12">
                <div className="fade-in-section space-y-10">
                  <div className="flex items-center gap-4">
                    <Info className="w-8 h-8 text-[var(--political-red)]" />
                    <h2 className="text-4xl font-black text-[var(--political-green)] tracking-tight">Program Overview</h2>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-16 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col gap-10">
                    {event.cover_image && (
                      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <img src={`/storage/${event.cover_image}`} alt={event.title} className="w-full aspect-video object-cover" />
                      </div>
                    )}

                    <div className="prose prose-xl dark:prose-invert max-w-none prose-p:text-gray-400 dark:prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed">
                      {event.content ? (
                        <div dangerouslySetInnerHTML={{ __html: event.content }} />
                      ) : (
                        <div className="text-center py-10 opacity-50 italic">Event agenda is being finalized...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Share Event</span>
                <button onClick={() => handleShare('facebook')} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                  <FaFacebookF className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('twitter')} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm">
                  <FaXTwitter className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('whatsapp')} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                  <FaWhatsapp className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('viber')} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#7360F2] hover:text-white transition-all shadow-sm">
                  <FaViber className="w-4 h-4" />
                </button>
                <button onClick={copyLink} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm">
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Registration Sidebar */}
            <div className="lg:col-span-5 fade-in-section">
              <div className="sticky top-32">
                <Card className="rounded-[3rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
                  <div className="p-10 text-center space-y-4 bg-[var(--political-red)] text-white">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight leading-none">Be a Part of It</h3>
                    <p className="text-white/70 font-medium leading-relaxed">Register as a volunteer and help us organize this landmark event.</p>
                  </div>

                  <CardContent className="p-10">
                    {flash?.success ? (
                      <div className="text-center py-10 animate-fade-in-up">
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-900/5">
                          <Check className="w-12 h-12 text-[var(--political-green)]" />
                        </div>
                        <h3 className="text-3xl font-black text-[var(--political-green)] mb-4 tracking-tight">Mission Confirmed!</h3>
                        <p className="text-gray-400 dark:text-gray-500 font-medium text-lg leading-relaxed">{flash.success}</p>
                        <Button
                          onClick={() => flash.success = undefined}
                          variant="outline"
                          className="mt-10 rounded-2xl px-10 py-6 font-black text-sm uppercase tracking-widest border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all dark:text-white"
                        >
                          REGISTER ANOTHER
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Identification</Label>
                            <Input
                              value={data.full_name}
                              onChange={e => setData('full_name', e.target.value)}
                              placeholder="Full Name *"
                              className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-[var(--political-red)] transition-all font-bold text-[var(--political-green)]"
                              required
                            />
                            {errors.full_name && <p className="text-[var(--political-red)] text-[10px] font-bold ml-4">{errors.full_name}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Input
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                placeholder="Contact Number *"
                                className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-[var(--political-red)] transition-all font-bold text-[var(--political-green)]"
                                required
                              />
                              {errors.phone && <p className="text-[var(--political-red)] text-[10px] font-bold ml-4">{errors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="Email Address *"
                                className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-[var(--political-red)] transition-all font-bold text-[var(--political-green)]"
                                required
                              />
                              {errors.email && <p className="text-[var(--political-red)] text-[10px] font-bold ml-4">{errors.email}</p>}
                            </div>
                          </div>

                          <div className="space-y-4 pt-4">
                            <Label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-4">Deployment Area</Label>

                            <div className="grid grid-cols-1 gap-4">
                              <Select value={selectedProvince} onValueChange={setSelectedProvince} disabled={provinceLocked} required>
                                <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-100 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white">
                                  <SelectValue placeholder="Select Province *" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  {scopedProvinces.map((province) => (
                                    <SelectItem key={province.id} value={province.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{province.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedProvince || loadingDistricts || districtLocked} required>
                                <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-100 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white">
                                  <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select District *"} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  {districts.map((district) => (
                                    <SelectItem key={district.id} value={district.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{district.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality} disabled={!selectedDistrict || loadingMunicipalities || municipalityLocked} required>
                                <SelectTrigger className="rounded-2xl h-16 px-8 bg-gray-100 dark:bg-gray-800 border-transparent dark:border-gray-700 dark:text-white">
                                  <SelectValue placeholder={loadingMunicipalities ? "Loading..." : "Select Municipality *"} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  {municipalities.map((municipality) => (
                                    <SelectItem key={municipality.id} value={municipality.id.toString()} className="dark:text-white dark:focus:bg-gray-700">{municipality.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                value={data.ward_number}
                                onChange={e => setData('ward_number', e.target.value)}
                                placeholder="Ward Number *"
                                className="rounded-2xl h-16 px-8 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:ring-[var(--political-red)] transition-all font-bold text-[var(--political-green)]"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={processing}
                          className="w-full py-6 bg-[var(--political-red)] text-white rounded-2xl font-black text-lg shadow-2xl shadow-red-900/10 hover:shadow-red-900/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group/btn"
                        >
                          {processing ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                            <>
                              SECURE MY SPOT
                              <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>

                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-widest leading-loose">
                          By joining, you commit to our principles of<br />integrity and national service.
                        </p>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
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
