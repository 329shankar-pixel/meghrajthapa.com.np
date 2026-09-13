import InteractiveTimeline from '@/components/public/interactive-timeline';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Eye, Flag, Globe, Mail, MapPin, Phone, ShieldCheck, User, Users } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaViber, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { TbWorld } from 'react-icons/tb';

interface Timeline {
    id: number;
    title: string;
    date: string;
    photo: string | null;
}

interface Leader {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    slug: string;
    image: string | null;
    bio: string | null;
    social_links: Record<string, string> | null;
}

interface Props {
    leader: Leader | null;
    timelines: Timeline[];
}

const storage = (path?: string | null) => (path ? `/storage/${path}` : null);

const formatYear = (date?: string | null) => {
    if (!date) return 'Present';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.getFullYear().toString();
};

const stripHtml = (html?: string | null) => (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('viber:')) return url;
    return `https://${url}`;
};

export default function Biography({ leader, timelines = [] }: Props) {
    const { settings, name } = usePage<any>().props;
    const partyName = settings?.party_name || name || 'Nepali Congress';
    const leaderName = leader?.name || settings?.leader_name || partyName;
    const image = storage(leader?.image) || storage(settings?.hero_image) || storage(settings?.site_logo);
    const summary =
        stripHtml(leader?.bio) ||
        settings?.homepage_primary_message ||
        'A public leadership profile focused on democratic values, community service, and accountable development.';
    const timelineItems =
        timelines.length > 0
            ? timelines
            : [
                  { id: 1, title: 'Grassroots organizing and public service', date: '1994-01-01', photo: null },
                  { id: 2, title: 'Community mobilization for democratic restoration', date: '2005-01-01', photo: null },
                  { id: 3, title: 'Representative leadership and local development work', date: '2017-01-01', photo: null },
              ];
    const galleryItems = timelineItems.filter((item) => item.photo).slice(0, 3);
    const socialIcons: Record<string, any> = {
        facebook: FaFacebookF,
        twitter: FaXTwitter,
        instagram: FaInstagram,
        youtube: FaYoutube,
        whatsapp: FaWhatsapp,
        viber: FaViber,
        website: TbWorld,
    };

    return (
        <PublicLayout socialLinks={leader?.social_links ?? undefined} title={`About ${leaderName} | ${partyName}`} description={summary}>
            <Head title={`About ${leaderName}`} />

            <section className="bg-congress-surface-muted px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
                    <div>
                        <span className="inline-flex border-l-4 border-congress-red pl-3 text-xs font-black uppercase tracking-[0.24em] text-congress-red">
                            Leadership Profile
                        </span>
                        <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-slate-950 md:text-7xl dark:text-white">
                            Dedicated to the People, Driven by Progress.
                        </h1>
                        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-white/72">{summary}</p>
                        <div className="mt-10 flex flex-wrap items-center gap-6">
                            <div>
                                <p className="font-display text-4xl font-bold text-congress-green-deep dark:text-white">{timelineItems.length}+</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Milestones</p>
                            </div>
                            <div className="h-12 w-px bg-congress-outline" />
                            <div>
                                <p className="font-display text-4xl font-bold text-congress-green-deep dark:text-white">{partyName}</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Public Movement</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/5] overflow-hidden rounded-lg border border-congress-outline bg-white shadow-campaign">
                            {image ? (
                                <img src={image} alt={leaderName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-congress-green-deep/8">
                                    <User className="h-20 w-20 text-congress-green-deep/40" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded bg-congress-green-deep px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-campaign">
                            <ShieldCheck className="h-5 w-5" />
                            Democratic Representative
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-congress-surface px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.42fr_0.58fr]">
                    <div>
                        <h2 className="font-display text-4xl font-bold text-slate-950 md:text-5xl dark:text-white">The Journey of Resilience</h2>
                        <div className="mt-5 h-1 w-16 bg-congress-green-deep" />
                        <p className="mt-7 text-lg font-semibold italic leading-8 text-slate-600 dark:text-white/72">
                            "True leadership is measured by the empowerment of every citizen and every community."
                        </p>
                        <div className="mt-8 grid gap-3">
                            {[
                                { icon: ShieldCheck, label: 'Integrity', text: 'Accountable public service' },
                                { icon: Eye, label: 'Transparency', text: 'Open governance' },
                                { icon: Users, label: 'Unity', text: 'Inclusive progress' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-4 border border-congress-outline bg-white p-4 dark:border-white/10 dark:bg-white/5">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-congress-green-deep text-white">
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block font-display text-xl font-bold text-slate-950 dark:text-white">{item.label}</span>
                                        <span className="text-sm text-slate-500 dark:text-white/60">{item.text}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-congress-green-deep prose-p:leading-8 prose-p:text-slate-600 dark:prose-invert dark:prose-p:text-white/72">
                            {leader?.bio ? (
                                <div dangerouslySetInnerHTML={{ __html: leader.bio }} />
                            ) : (
                                <>
                                    <p>{summary}</p>
                                    <p>
                                        Add the leader biography in the admin panel to publish the full story here. The page will keep this editorial layout while using the
                                        saved profile content, portrait, social links, and timeline milestones.
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {leader?.email && (
                                <a href={`mailto:${leader.email}`} className="flex items-center gap-4 border border-congress-outline bg-white p-4 text-congress-green-deep transition hover:border-congress-red hover:text-congress-red dark:border-white/10 dark:bg-white/5 dark:text-white">
                                    <Mail className="h-5 w-5" />
                                    <span className="min-w-0 truncate font-bold">{leader.email}</span>
                                </a>
                            )}
                            {leader?.phone && (
                                <a href={`tel:${leader.phone}`} className="flex items-center gap-4 border border-congress-outline bg-white p-4 text-congress-green-deep transition hover:border-congress-red hover:text-congress-red dark:border-white/10 dark:bg-white/5 dark:text-white">
                                    <Phone className="h-5 w-5" />
                                    <span className="min-w-0 truncate font-bold">{leader.phone}</span>
                                </a>
                            )}
                            {settings?.campaign_office_address && (
                                <div className="flex items-center gap-4 border border-congress-outline bg-white p-4 text-congress-green-deep dark:border-white/10 dark:bg-white/5 dark:text-white md:col-span-2">
                                    <MapPin className="h-5 w-5 shrink-0" />
                                    <span className="font-bold">{settings.campaign_office_address}</span>
                                </div>
                            )}
                        </div>

                        {leader?.social_links && Object.entries(leader.social_links).some(([, url]) => !!url) && (
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(leader.social_links).map(([platform, url]) => {
                                    if (!url) return null;
                                    const Icon = socialIcons[platform] || Globe;
                                    return (
                                        <a
                                            key={platform}
                                            href={normalizeUrl(url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-11 w-11 items-center justify-center border border-congress-outline text-congress-green-deep transition hover:bg-congress-red hover:text-white dark:border-white/10 dark:text-white"
                                            aria-label={platform}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-white px-4 py-16 dark:bg-slate-950 md:px-6 md:py-24">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center font-display text-4xl font-bold text-slate-950 md:text-5xl dark:text-white">A Legacy of Service</h2>
                    <div className="mt-14">
                        <InteractiveTimeline items={timelineItems} />
                    </div>
                </div>
            </section>

            {galleryItems.length > 0 && (
                <section className="bg-congress-surface px-4 py-16 md:px-6 md:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <h2 className="font-display text-4xl font-bold text-slate-950 md:text-5xl dark:text-white">Community Engagement</h2>
                                <p className="mt-3 text-slate-600 dark:text-white/70">Published milestone photos from the admin panel.</p>
                            </div>
                            <Link href="/media/galleries" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-congress-green-deep hover:text-congress-red dark:text-white">
                                View Full Gallery <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            {galleryItems.map((item, index) => (
                                <Link
                                    key={item.id}
                                    href="/media/galleries"
                                    className={`group relative overflow-hidden border border-congress-outline ${index === 0 ? 'md:col-span-2 md:row-span-2 aspect-[16/10]' : 'aspect-[4/3]'}`}
                                >
                                    <img src={storage(item.photo) || ''} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">{formatYear(item.date)}</p>
                                        <h3 className="mt-1 font-display text-2xl font-bold">{item.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-congress-green-deep px-4 py-12 text-white md:px-6">
                <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-10">
                    {[
                        { icon: ShieldCheck, label: 'Integrity', text: 'Unwavering honesty' },
                        { icon: Eye, label: 'Transparency', text: 'Open governance' },
                        { icon: CheckCircle2, label: 'Unity', text: 'Inclusive progress' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4">
                            <item.icon className="h-10 w-10" />
                            <div>
                                <h3 className="font-display text-2xl font-bold">{item.label}</h3>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
