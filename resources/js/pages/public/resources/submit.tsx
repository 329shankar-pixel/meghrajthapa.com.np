import PublicLayout from '@/layouts/public-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    FileText,
    Image as ImageIcon,
    Loader2,
    Mail,
    Map,
    MapPin,
    Phone,
    Share2,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FaFacebookF, FaViber, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

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
    category_id?: number;
}

interface Props {
    provinces: Province[];
    leader?: any;
    locationScope?: {
        province_id?: string;
        district_id?: string;
        municipality_id?: string;
    };
}

export default function SubmitResource({ provinces, leader, locationScope = {} }: Props) {
    const { flash, name, settings } = usePage<any>().props;
    const partyName = name || 'Nepali Congress';
    const leaderName = leader?.name || settings?.leader_name || partyName;
    const [selectedProvince, setSelectedProvince] = useState(locationScope.province_id || '');
    const [selectedDistrict, setSelectedDistrict] = useState(locationScope.district_id || '');
    const [selectedMunicipality, setSelectedMunicipality] = useState(locationScope.municipality_id || '');
    const [districts, setDistricts] = useState<District[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        project_category: '',
        urgency: 'normal',
        description: '',
        estimated_budget: '',
        beneficiaries: '',
        province_id: locationScope.province_id || '',
        district_id: locationScope.district_id || '',
        municipality_id: locationScope.municipality_id || '',
        ward_number: '',
        tole: '',
        person_name: '',
        person_email: '',
        person_phone: '',
        photos: [] as File[],
    });

    const scopedProvinces = locationScope.province_id
        ? provinces.filter((province) => province.id.toString() === locationScope.province_id)
        : provinces;
    const provinceLocked = Boolean(locationScope.province_id);
    const districtLocked = Boolean(locationScope.district_id);
    const municipalityLocked = Boolean(locationScope.municipality_id);

    useEffect(() => {
        if (!selectedProvince) return;
        setLoadingDistricts(true);
        setDistricts([]);
        setMunicipalities([]);
        if (!districtLocked) setSelectedDistrict('');
        if (!municipalityLocked) setSelectedMunicipality('');
        setData('province_id', selectedProvince);
        if (!districtLocked) setData('district_id', '');
        if (!municipalityLocked) setData('municipality_id', '');

        fetch(`/api/provinces/${selectedProvince}/districts`)
            .then((res) => res.json())
            .then((items) => {
                const nextItems = districtLocked ? items.filter((item: District) => item.id.toString() === locationScope.district_id) : items;
                setDistricts(nextItems);
            })
            .finally(() => setLoadingDistricts(false));
    }, [selectedProvince, districtLocked, municipalityLocked, locationScope.district_id]);

    useEffect(() => {
        if (!selectedDistrict) return;
        setLoadingMunicipalities(true);
        setMunicipalities([]);
        if (!municipalityLocked) setSelectedMunicipality('');
        setData('district_id', selectedDistrict);
        if (!municipalityLocked) setData('municipality_id', '');

        fetch(`/api/districts/${selectedDistrict}/municipalities`)
            .then((res) => res.json())
            .then((items) => {
                const nextItems = municipalityLocked ? items.filter((item: Municipality) => item.id.toString() === locationScope.municipality_id) : items;
                setMunicipalities(nextItems);
            })
            .finally(() => setLoadingMunicipalities(false));
    }, [selectedDistrict, municipalityLocked, locationScope.municipality_id]);

    useEffect(() => {
        if (selectedMunicipality) setData('municipality_id', selectedMunicipality);
    }, [selectedMunicipality]);

    const selectedNames = useMemo(() => {
        const province = provinces.find((item) => item.id.toString() === selectedProvince)?.name;
        const district = districts.find((item) => item.id.toString() === selectedDistrict)?.name;
        const municipality = municipalities.find((item) => item.id.toString() === selectedMunicipality)?.name;
        return { province, district, municipality };
    }, [districts, municipalities, provinces, selectedDistrict, selectedMunicipality, selectedProvince]);

    const locationSummary = [
        selectedNames.province,
        selectedNames.district,
        selectedNames.municipality,
        data.ward_number ? `Ward ${data.ward_number}` : null,
        data.tole || null,
    ]
        .filter(Boolean)
        .join(', ');

    const share = (platform: string) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`${leaderName} is asking citizens to share local project needs. Submit your community concern here.`);
        const links: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://x.com/intent/tweet?url=${url}&text=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            viber: `viber://forward?text=${text}%20${url}`,
        };
        window.open(links[platform], '_blank', 'width=640,height=520');
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files ? Array.from(event.target.files) : [];
        setData('photos', [...data.photos, ...files]);
        setPreviews([...previews, ...files.map((file) => URL.createObjectURL(file))]);
    };

    const removePhoto = (index: number) => {
        const nextPhotos = [...data.photos];
        const nextPreviews = [...previews];
        URL.revokeObjectURL(nextPreviews[index]);
        nextPhotos.splice(index, 1);
        nextPreviews.splice(index, 1);
        setData('photos', nextPhotos);
        setPreviews(nextPreviews);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/community/resources/submit', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreviews([]);
                setSelectedProvince(locationScope.province_id || '');
                setSelectedDistrict(locationScope.district_id || '');
                setSelectedMunicipality(locationScope.municipality_id || '');
            },
        });
    };

    return (
        <PublicLayout
            socialLinks={leader?.social_links ?? undefined}
            title={`Send Your Community Need to ${leaderName}`}
            description={`${leaderName} is collecting ward-level problems, project requests, and citizen priorities directly from the community.`}
        >
            <Head title={`Send Your Community Need to ${leaderName}`} />

            <section className="relative overflow-hidden bg-congress-green-deep text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(200,16,46,0.55),transparent_34%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-slate-950" />
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] backdrop-blur">
                            <Map className="h-4 w-4" />
                            Message from {leaderName}
                        </div>
                        <h1 className="mt-7 font-display text-5xl font-black leading-[0.98] md:text-7xl">
                            Tell us what your community needs most.
                        </h1>
                        <p className="mt-6 max-w-2xl font-nepali text-lg leading-8 text-white/82 md:text-xl">
                            On behalf of {leaderName}, this form is open for citizens to report real ward-level problems, urgent public needs, and development projects that deserve follow-up.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {[
                                ['7 Provinces', 'Province'],
                                ['77 Districts', 'District'],
                                ['753 Local Levels', 'Municipality'],
                                ['Ward + Tole', 'Citizen Voice'],
                            ].map(([title, label]) => (
                                <div key={title} className="rounded-lg border border-white/18 bg-white/10 px-5 py-4 backdrop-blur">
                                    <p className="font-display text-xl font-black">{title}</p>
                                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/58">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white p-5 text-slate-950 shadow-2xl">
                        <div className="rounded-xl bg-slate-50 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-congress-red">Where should we listen?</p>
                                    <h2 className="mt-2 font-display text-2xl font-black text-congress-green-deep">Your Community Address</h2>
                                </div>
                                <MapPin className="h-9 w-9 text-congress-red" />
                            </div>
                            <div className="mt-6 rounded-lg border border-congress-green-deep/10 bg-white p-5">
                                <p className="text-sm font-bold text-slate-500">Selected community</p>
                                <p className="mt-2 min-h-12 font-nepali text-xl font-black text-congress-green-deep">
                                    {locationSummary || 'Select your province, district, municipality and ward'}
                                </p>
                            </div>
                            <div className="mt-5 grid grid-cols-4 gap-2">
                                {['Province', 'District', 'Municipality', 'Ward'].map((item, index) => (
                                    <div key={item} className={`h-2 rounded-full ${index <= [selectedProvince, selectedDistrict, selectedMunicipality, data.ward_number].filter(Boolean).length - 1 ? 'bg-congress-red' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16 dark:bg-slate-950 md:py-24">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    {flash?.success ? (
                        <div className="mx-auto max-w-2xl rounded-2xl border border-congress-green-deep/10 bg-white p-10 text-center shadow-campaign dark:border-white/10 dark:bg-white/5">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-congress-green-deep text-white">
                                <Check className="h-10 w-10" />
                            </div>
                            <h2 className="mt-6 font-display text-4xl font-black text-congress-green-deep dark:text-white">Your message reached the campaign</h2>
                            <p className="mt-4 text-slate-600 dark:text-white/70">{flash.success}</p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                <Link href="/community/resources/submit" className="rounded-full bg-congress-red px-6 py-3 text-sm font-black text-white">Send Another Need</Link>
                                <Link href="/" className="rounded-full border border-congress-green-deep/20 px-6 py-3 text-sm font-black text-congress-green-deep dark:text-white">Back Home</Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                            <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
                                <div className="rounded-2xl bg-congress-green-deep p-6 text-white shadow-campaign">
                                    <Sparkles className="h-7 w-7" />
                                    <h2 className="mt-4 font-display text-2xl font-black">Before sending to {leaderName}</h2>
                                    <div className="mt-6 grid gap-3">
                                        {[
                                            ['Explain the local problem clearly', !!data.title && !!data.description],
                                            ['Confirm the exact ward address', !!selectedProvince && !!selectedDistrict && !!selectedMunicipality && !!data.ward_number],
                                            ['Attach location photos if possible', previews.length > 0],
                                            ['Add a reachable contact person', !!data.person_name && !!data.person_phone],
                                        ].map(([label, done]) => (
                                            <div key={label as string} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                                                <CheckCircle2 className={`h-5 w-5 ${done ? 'text-white' : 'text-white/35'}`} />
                                                <span className="text-sm font-bold text-white/82">{label as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-congress-green-deep/10 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-congress-red">Ask others to report needs</p>
                                    <div className="mt-4 flex gap-2">
                                        {[
                                            ['facebook', FaFacebookF],
                                            ['twitter', FaXTwitter],
                                            ['whatsapp', FaWhatsapp],
                                            ['viber', FaViber],
                                        ].map(([platform, Icon]: any) => (
                                            <button key={platform} type="button" onClick={() => share(platform)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-congress-green-deep shadow-sm transition hover:bg-congress-red hover:text-white dark:bg-slate-950">
                                                <Icon className="h-4 w-4" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>

                            <div className="space-y-6">
                                <FormCard icon={FileText} title="Community Need" kicker={`What should ${leaderName} know?`}>
                                    <Field label="Main issue or project request" error={errors.title}>
                                        <input value={data.title} onChange={(e) => setData('title', e.target.value)} required placeholder="e.g. Drinking water repair, school boundary wall" className="field-input" />
                                    </Field>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field label="Category" error={errors.project_category}>
                                            <select value={data.project_category} onChange={(e) => setData('project_category', e.target.value)} className="field-input">
                                                <option value="">Select category</option>
                                                <option value="Infrastructure">Infrastructure</option>
                                                <option value="Water & Sanitation">Water & Sanitation</option>
                                                <option value="Education">Education</option>
                                                <option value="Health">Health</option>
                                                <option value="Youth & Sports">Youth & Sports</option>
                                                <option value="Agriculture">Agriculture</option>
                                            </select>
                                        </Field>
                                        <Field label="Urgency" error={errors.urgency}>
                                            <select value={data.urgency} onChange={(e) => setData('urgency', e.target.value)} className="field-input">
                                                <option value="normal">Normal</option>
                                                <option value="important">Important</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </Field>
                                        <Field label="Who will benefit?" error={errors.beneficiaries}>
                                            <input value={data.beneficiaries} onChange={(e) => setData('beneficiaries', e.target.value)} placeholder="e.g. 120 households, one school, local farmers" className="field-input" />
                                        </Field>
                                    </div>
                                    <Field label="Message to the leader" error={errors.description}>
                                        <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} required rows={6} placeholder={`Write what ${leaderName} should understand: the current condition, why it matters, who is affected, and what action is expected.`} className="field-input min-h-40 resize-y py-4" />
                                    </Field>
                                    <Field label="Estimated Budget / Need" error={errors.estimated_budget}>
                                        <input value={data.estimated_budget} onChange={(e) => setData('estimated_budget', e.target.value)} placeholder="Optional: e.g. NPR 5,00,000 or technical inspection needed" className="field-input" />
                                    </Field>
                                </FormCard>

                                <FormCard icon={MapPin} title="Where is the problem?" kicker="Province, district, municipality and ward">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <SelectField label="Province" value={selectedProvince} onChange={setSelectedProvince} placeholder="Choose province" items={scopedProvinces} disabled={provinceLocked} error={errors.province_id} />
                                        <SelectField label="District" value={selectedDistrict} onChange={setSelectedDistrict} placeholder={loadingDistricts ? 'Loading districts...' : 'Choose district'} items={districts} disabled={!selectedProvince || loadingDistricts || districtLocked} error={errors.district_id} />
                                        <SelectField label="Municipality / Rural Municipality" value={selectedMunicipality} onChange={setSelectedMunicipality} placeholder={loadingMunicipalities ? 'Loading local levels...' : 'Choose municipality'} items={municipalities} disabled={!selectedDistrict || loadingMunicipalities || municipalityLocked} error={errors.municipality_id} />
                                        <Field label="Ward Number" error={errors.ward_number}>
                                            <input type="number" min="1" max="33" value={data.ward_number} onChange={(e) => setData('ward_number', e.target.value)} required placeholder="Ward no." className="field-input" />
                                        </Field>
                                    </div>
                                    <Field label="Tole / Street / Local Landmark" error={errors.tole}>
                                        <input value={data.tole} onChange={(e) => setData('tole', e.target.value)} placeholder="e.g. Milan Tole, near ward office" className="field-input" />
                                    </Field>
                                </FormCard>

                                <FormCard icon={Camera} title="Photos from the place" kicker="Help the campaign verify the issue">
                                    <label htmlFor="photos" className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-congress-green-deep/20 bg-slate-50 px-6 py-10 text-center transition hover:border-congress-red hover:bg-white dark:bg-white/5">
                                        <ImageIcon className="h-10 w-10 text-congress-red transition group-hover:scale-110" />
                                        <p className="mt-4 font-display text-xl font-black text-congress-green-deep dark:text-white">Upload photos that show the real condition</p>
                                        <p className="mt-2 text-sm font-medium text-slate-500">Photos help {leaderName}'s team understand and verify the request.</p>
                                        <input id="photos" type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {previews.map((src, index) => (
                                                <div key={src} className="group relative aspect-square overflow-hidden rounded-xl">
                                                    <img src={src} alt={`Community project preview ${index + 1}`} className="h-full w-full object-cover" />
                                                    <button type="button" onClick={() => removePhoto(index)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-congress-red text-white opacity-0 transition group-hover:opacity-100">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </FormCard>

                                <FormCard icon={User} title="Contact Person" kicker="Who can the campaign call?">
                                    <Field label="Full Name" error={errors.person_name}>
                                        <div className="relative"><User className="field-icon" /><input value={data.person_name} onChange={(e) => setData('person_name', e.target.value)} required placeholder="Your full name" className="field-input pl-12" /></div>
                                    </Field>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Email" error={errors.person_email}>
                                            <div className="relative"><Mail className="field-icon" /><input type="email" value={data.person_email} onChange={(e) => setData('person_email', e.target.value)} required placeholder="email@example.com" className="field-input pl-12" /></div>
                                        </Field>
                                        <Field label="Phone / WhatsApp / Viber" error={errors.person_phone}>
                                            <div className="relative"><Phone className="field-icon" /><input value={data.person_phone} onChange={(e) => setData('person_phone', e.target.value)} required placeholder="98XXXXXXXX" className="field-input pl-12" /></div>
                                        </Field>
                                    </div>
                                </FormCard>

                                <button type="submit" disabled={processing} className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-congress-red px-8 py-5 font-black uppercase tracking-[0.16em] text-white shadow-patriotic transition hover:-translate-y-1 hover:bg-congress-green-deep disabled:opacity-60">
                                    {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Share2 className="h-5 w-5" />}
                                    Send Request to {leaderName}
                                    {!processing && <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}

function FormCard({ icon: Icon, title, kicker, children }: { icon: any; title: string; kicker: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-congress-green-deep/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-congress-green-deep text-white">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-congress-red">{kicker}</p>
                    <h2 className="font-display text-2xl font-black text-congress-green-deep dark:text-white">{title}</h2>
                </div>
            </div>
            <div className="grid gap-5">{children}</div>
        </section>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-white/55">{label}</span>
            {children}
            {error && <span className="text-sm font-bold text-congress-red">{error}</span>}
        </label>
    );
}

function SelectField({ label, value, onChange, items, placeholder, disabled, error }: { label: string; value: string; onChange: (value: string) => void; items: { id: number; name: string }[]; placeholder: string; disabled?: boolean; error?: string }) {
    return (
        <Field label={label} error={error}>
            <div className="relative">
                <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} required className="field-input appearance-none pr-12 disabled:cursor-not-allowed disabled:opacity-55">
                    <option value="">{placeholder}</option>
                    {items.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-congress-green-deep" />
            </div>
        </Field>
    );
}
