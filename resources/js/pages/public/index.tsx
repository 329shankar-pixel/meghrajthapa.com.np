import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Building2,
    CalendarDays,
    Camera,
    CheckCircle2,
    FileText,
    Flag,
    HandHeart,
    Landmark,
    Mail,
    MapPin,
    MessageCircle,
    Newspaper,
    Phone,
    PlayCircle,
    ShieldCheck,
    Target,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';

interface Timeline {
    id: number;
    title: string;
    date: string;
    photo: string | null;
}

interface News {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
}

interface EventItem {
    id: number;
    title: string;
    slug: string;
    event_date: string;
    location: string | null;
    cover_image: string | null;
}

interface Activity {
    id: number;
    title: string;
    slug: string;
    location: string;
    date: string | null;
    cover_image: string | null;
    photos?: { id: number; photo_path: string }[];
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

interface StatItem {
    icon: string | null;
    value: string;
    label: string;
}

interface MissionItem {
    title: string;
    description: string;
    icon: string | null;
    color: string;
}

interface Props {
    leader: Leader | null;
    timelines: Timeline[];
    news: News[];
    posts: Post[];
    events: EventItem[];
    activities: Activity[];
    stats: StatItem[];
    missions: MissionItem[];
    partyName?: string;
    settings: Record<string, string>;
}

const storage = (path?: string | null) => (path ? `/storage/${path}` : null);

const formatDate = (date?: string | null) => {
    if (!date) return 'Recent';
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
};

const whatsappUrl = (phone?: string | null, message = 'Namaste, I want to support the campaign.') => {
    if (!phone) return '';
    let normalized = phone.replace(/\D+/g, '');
    if (normalized.length === 10 && normalized.startsWith('9')) normalized = `977${normalized}`;
    return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : '';
};

export default function PublicHome({ leader, timelines = [], news = [], posts = [], events = [], activities = [], stats = [], missions = [], partyName = 'Nepali Congress', settings = {} }: Props) {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
            { threshold: 0.14 },
        );

        document.querySelectorAll('.campaign-reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const siteName = settings.party_name || partyName;
    const leaderName = siteName;
    const heroImage = storage(settings.hero_image) || storage(leader?.image);
    const ogImage = storage(settings.og_image) || heroImage || '/logo.svg';
    const campaignWhatsapp = whatsappUrl(settings.campaign_whatsapp_number || leader?.social_links?.whatsapp || leader?.phone, `Namaste, I want to support ${leaderName}.`);
    const campaignEmail = settings.campaign_notification_email || settings.contact_email || leader?.email;
    const defaultHeroMessage =
        'Stand with a people-first campaign committed to honest leadership, local development, youth opportunity, and a stronger democratic future for every family.';

    const displayStats =
        stats.length > 0
            ? stats
            : [
                  { icon: 'Users', value: '100K+', label: 'Supporters united' },
                  { icon: 'MapPin', value: '753', label: 'Communities in focus' },
                  { icon: 'HandHeart', value: '500+', label: 'Volunteers ready' },
                  { icon: 'Award', value: '25+', label: 'Years of service' },
              ];

    const platform =
        missions.length > 0
            ? missions
            : [
                  { title: settings.campaign_issue_1_title || 'Clean Governance', description: settings.campaign_issue_1_description || 'Every public decision should be transparent, accountable, and focused on service instead of privilege.', icon: null, color: 'green' },
                  { title: settings.campaign_issue_2_title || 'Jobs & Local Economy', description: settings.campaign_issue_2_description || 'We will stand with youth, farmers, workers, and small businesses so opportunity reaches every ward.', icon: null, color: 'red' },
                  { title: settings.campaign_issue_3_title || 'Education & Health', description: settings.campaign_issue_3_description || 'Families deserve reliable schools, accessible health care, and public services that work with dignity.', icon: null, color: 'green' },
                  { title: settings.campaign_issue_4_title || 'Community Projects', description: settings.campaign_issue_4_description || 'Your road, water, school, health post, and local project concerns deserve a direct path to action.', icon: null, color: 'red' },
              ];

    const statIcons: Record<string, any> = { Users, MapPin, HandHeart, Award };
    const issueIcons = [ShieldCheck, Building2, Landmark, Target];
    const latestActivities = activities.slice(0, 4);
    const latestNews = news.slice(0, 4);
    const latestPosts = posts.slice(0, 3);
    const latestEvents = events.slice(0, 3);
    const copy = (key: string, fallback: string) => settings[key] || fallback;

    return (
        <PublicLayout
            partyName={siteName}
            socialLinks={leader?.social_links ?? undefined}
            title={copy('homepage_meta_title', `${siteName} | जनताको अभियान`)}
            description={settings.homepage_primary_message || defaultHeroMessage}
            image={ogImage}
        >
            <section className="overflow-hidden bg-congress-surface-muted px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
                    <div className="campaign-reveal">
                        <span className="inline-flex items-center gap-2 border-l-4 border-congress-red pl-3 text-xs font-black uppercase tracking-[0.24em] text-congress-red">
                            <Flag className="h-4 w-4" />
                            {copy('homepage_eyebrow', 'जनताको आवाज, विकासको संकल्प')}
                        </span>
                        <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-tight text-slate-950 md:text-7xl dark:text-white">
                            {copy('hero_title', leaderName)}
                        </h1>
                        <p className="mt-5 max-w-3xl font-nepali text-2xl font-bold leading-tight text-congress-green-deep md:text-4xl dark:text-white">
                            {copy('hero_subtitle', 'लोकतन्त्र, विकास र जनसेवाका लागि एकताबद्ध अभियान')}
                        </p>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-white/72">
                            {settings.homepage_primary_message || settings.hero_description || defaultHeroMessage}
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link href="/joinnow" className="inline-flex items-center justify-center gap-3 rounded bg-congress-green-deep px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-campaign transition hover:-translate-y-1 hover:bg-congress-red">
                                {copy('homepage_primary_cta_label', 'Join the Movement')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/community/resources/submit" className="inline-flex items-center justify-center gap-3 rounded border border-congress-outline bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:border-congress-red hover:text-congress-red dark:bg-white/5 dark:text-white">
                                {copy('homepage_secondary_cta_label', 'Submit Local Project')}
                            </Link>
                            {campaignWhatsapp && (
                                <a href={campaignWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded bg-congress-red px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-1 hover:bg-congress-green-deep">
                                    <MessageCircle className="h-4 w-4" />
                                    {copy('homepage_whatsapp_label', 'WhatsApp')}
                                </a>
                            )}
                        </div>
                        <div className="mt-10 flex flex-wrap gap-6">
                            {displayStats.slice(0, 3).map((stat) => (
                                <div key={stat.label} className="border-l border-congress-outline pl-5">
                                    <p className="font-display text-4xl font-bold text-congress-green-deep dark:text-white">{stat.value}</p>
                                    <p className="max-w-32 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="campaign-reveal relative">
                        <div className="aspect-[4/5] overflow-hidden rounded-lg border border-congress-outline bg-white shadow-campaign">
                            {heroImage ? (
                                <img src={heroImage} alt={`${leaderName} campaign portrait`} className="h-full w-full object-contain object-center p-2" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-congress-green-deep/8 text-congress-green-deep">
                                    <Flag className="h-20 w-20" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded bg-congress-green-deep px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-campaign">
                            <CheckCircle2 className="h-5 w-5" />
                            {copy('homepage_hero_badge_label', 'Ready to Serve')}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#fffdf8] py-10 dark:bg-slate-950">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4 md:px-6">
                    {displayStats.map((stat) => {
                        const Icon = statIcons[stat.icon || ''] || Award;
                        return (
                            <div key={stat.label} className="campaign-reveal campaign-panel rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-campaign">
                                <Icon className="h-7 w-7 text-congress-red" />
                                <p className="mt-4 font-display text-4xl font-black text-congress-green-deep dark:text-white">{stat.value}</p>
                                <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section id="vision" className="bg-campaign-surface py-20 dark:bg-slate-950 md:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="campaign-reveal">
                        <p className="text-sm font-black uppercase tracking-[0.24em] text-congress-red">{copy('homepage_vision_label', 'Vision & Priorities')}</p>
                        <h2 className="mt-4 font-display text-4xl font-black leading-tight text-congress-green-deep md:text-6xl dark:text-white">
                            {copy('homepage_vision_title', 'A clear agenda for honest leadership and local progress.')}
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-white/70">
                            {copy('homepage_vision_description', 'This campaign is built around the issues followers raise every day: jobs, roads, education, health, dignity, and accountable service.')}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {platform.map((item, index) => {
                            const Icon = issueIcons[index % issueIcons.length];
                            const isRed = index % 2 === 1;
                            return (
                                <article key={item.title} className="campaign-reveal campaign-panel rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-patriotic">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isRed ? 'bg-congress-red' : 'bg-congress-green-deep'} text-white`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 font-display text-2xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/68">{item.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-congress-green-deep py-20 text-white md:py-28">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="campaign-reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-white/62">{copy('homepage_biography_label', 'Biography + Public Record')}</p>
                            <h2 className="mt-4 font-display text-4xl font-black md:text-6xl">{copy('homepage_biography_title', 'Leadership followers can trust.')}</h2>
                        </div>
                        <Link href="/biography" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:bg-congress-red hover:text-white">
                            {copy('homepage_biography_button_label', 'Full Biography')} <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {(timelines.length ? timelines.slice(0, 6) : [{ id: 1, title: copy('homepage_timeline_empty_title', 'A record of democratic service, public accountability, and local development work'), date: new Date().toISOString(), photo: null }]).map((item) => (
                            <article key={item.id} className="campaign-reveal rounded-xl border border-white/15 bg-white/8 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:text-congress-green-deep">
                                <CalendarDays className="h-6 w-6 text-congress-red" />
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] opacity-70">{formatDate(item.date)}</p>
                                <h3 className="mt-2 font-display text-xl font-black">{item.title}</h3>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f5faf6] py-20 dark:bg-white/5 md:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[1fr_0.85fr]">
                    <div>
                        <div className="campaign-reveal flex items-end justify-between gap-5">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.24em] text-congress-red">{copy('homepage_news_label', 'Newsroom')}</p>
                                <h2 className="mt-4 font-display text-4xl font-black text-congress-green-deep md:text-6xl dark:text-white">{copy('homepage_news_title', 'Updates built for public trust.')}</h2>
                            </div>
                            <Newspaper className="hidden h-14 w-14 text-congress-green-deep md:block" />
                        </div>
                        <div className="mt-10 grid gap-4">
                            {latestNews.map((item) => (
                                <Link key={item.id} href={`/updates/news/${item.slug}`} className="campaign-reveal grid gap-4 rounded-xl border border-congress-green-deep/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-campaign dark:border-white/10 dark:bg-slate-950 md:grid-cols-[190px_1fr]">
                                    <div className="aspect-[16/10] overflow-hidden rounded-lg bg-congress-green-deep/8">
                                        {item.featured_image ? <img src={storage(item.featured_image) || ''} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Newspaper className="h-8 w-8 text-congress-green-deep" /></div>}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-congress-red">{formatDate(item.published_at)}</p>
                                        <h3 className="mt-2 font-display text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-white/68">{item.excerpt}</p>
                                    </div>
                                </Link>
                            ))}
                            {latestNews.length === 0 && <EmptyState icon={Newspaper} text={copy('homepage_news_empty_text', 'Publish news updates from the dashboard to populate this newsroom.')} />}
                        </div>
                    </div>

                    <div className="campaign-reveal rounded-2xl bg-congress-green-deep p-6 text-white shadow-campaign">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">{copy('homepage_action_label', 'Supporter Action Desk')}</p>
                                <h3 className="font-display text-3xl font-black">{copy('homepage_action_title', 'Take part in the campaign today.')}</h3>
                            </div>
                        </div>
                        <div className="mt-8 grid gap-3">
                            {[
                                { href: '/joinnow', title: copy('homepage_action_1_title', 'Register as supporter'), text: copy('homepage_action_1_text', 'Add your voice, your skills, and your local strength to the movement.'), icon: Users },
                                { href: '/program/events', title: copy('homepage_action_2_title', 'Volunteer for events'), text: copy('homepage_action_2_text', 'Join programs, meet neighbors, and help carry the message to every community.'), icon: CalendarDays },
                                { href: '/community/resources/submit', title: copy('homepage_action_3_title', 'Submit community project'), text: copy('homepage_action_3_text', 'Tell us what your ward needs so the campaign can follow up with purpose.'), icon: FileText },
                            ].map((item) => (
                                <Link key={item.href} href={item.href} className="group flex items-start gap-4 rounded-xl border border-white/12 bg-white/10 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:text-congress-green-deep">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-congress-red transition group-hover:bg-congress-red group-hover:text-white">
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block font-display text-lg font-black">{item.title}</span>
                                        <span className="mt-1 block text-sm leading-6 opacity-72">{item.text}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#fffdf8] py-20 dark:bg-slate-950 md:py-28">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="campaign-reveal flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-congress-red">{copy('homepage_activities_label', 'Achievements + Field Work')}</p>
                            <h2 className="mt-4 font-display text-4xl font-black text-congress-green-deep md:text-6xl dark:text-white">{copy('homepage_activities_title', 'Evidence from the ground.')}</h2>
                        </div>
                        <Link href="/program/activities" className="rounded-xl bg-congress-green-deep px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-congress-red">
                            {copy('homepage_activities_button_label', 'View Activities')}
                        </Link>
                    </div>
                    <div className="mt-12 grid gap-5 md:grid-cols-4">
                        {latestActivities.map((activity) => {
                            const image = storage(activity.cover_image) || storage(activity.photos?.[0]?.photo_path);
                            return (
                                <Link key={activity.id} href={`/program/activities/${activity.slug}`} className="campaign-reveal group relative aspect-[4/5] overflow-hidden rounded-xl bg-congress-green-deep shadow-sm transition hover:-translate-y-1 hover:shadow-campaign">
                                    {image ? <img src={image} alt={activity.title} className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-white"><Camera className="h-12 w-12" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-congress-green-deep via-congress-green-deep/25 to-transparent" />
                                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">{formatDate(activity.date)}</p>
                                        <h3 className="mt-2 font-display text-xl font-black">{activity.title}</h3>
                                        <p className="mt-2 flex items-center gap-2 text-sm text-white/75"><MapPin className="h-4 w-4" /> {activity.location}</p>
                                    </div>
                                </Link>
                            );
                        })}
                        {latestActivities.length === 0 && <EmptyState icon={Camera} text={copy('homepage_activities_empty_text', 'Add activities and galleries to turn this section into a visual campaign record.')} />}
                    </div>
                </div>
            </section>

            {(latestEvents.length > 0 || latestPosts.length > 0) && (
                <section className="bg-[#fffdf8] py-20 dark:bg-slate-950 md:py-28">
                    <div className="mx-auto max-w-7xl px-4 md:px-6">
                        <div className="campaign-reveal flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.24em] text-congress-red">{copy('homepage_programs_label', 'Public Programs')}</p>
                                <h2 className="mt-4 font-display text-4xl font-black text-congress-green-deep md:text-6xl dark:text-white">{copy('homepage_programs_title', 'Meet us, question us, and move forward with us.')}</h2>
                            </div>
                            <Link href="/program/events" className="rounded-xl bg-congress-green-deep px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-congress-red">
                                {copy('homepage_programs_button_label', 'View Events')}
                            </Link>
                        </div>
                        <div className="mt-12 grid gap-5 lg:grid-cols-2">
                            <AdminDataColumn title={copy('homepage_events_column_title', 'Upcoming Events')} href="/program/events" items={latestEvents.map((item) => ({
                                href: `/program/events/${item.id}`,
                                title: item.title,
                                meta: [formatDate(item.event_date), item.location].filter(Boolean).join(' / '),
                                icon: CalendarDays,
                            }))} />
                            <AdminDataColumn title={copy('homepage_articles_column_title', 'Articles')} href="/updates/blog" items={latestPosts.map((item) => ({
                                href: `/updates/blog/${item.slug}`,
                                title: item.title,
                                meta: item.excerpt || formatDate(item.published_at),
                                icon: FileText,
                            }))} />
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-campaign-surface py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="campaign-reveal flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-congress-red">{copy('homepage_media_label', 'Media Gallery')}</p>
                            <h2 className="mt-4 font-display text-4xl font-black text-congress-green-deep md:text-6xl dark:text-white">{copy('homepage_media_title', 'Photos and videos made to travel.')}</h2>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/media/galleries" className="rounded-xl border border-congress-green-deep/20 px-5 py-3 text-sm font-black text-congress-green-deep transition hover:bg-congress-green-deep hover:text-white dark:text-white">{copy('homepage_photos_button_label', 'Photos')}</Link>
                            <Link href="/media/videos" className="rounded-xl bg-congress-red px-5 py-3 text-sm font-black text-white transition hover:bg-congress-green-deep">{copy('homepage_videos_button_label', 'Videos')}</Link>
                        </div>
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-4">
                        {latestActivities.map((activity) => {
                            const image = storage(activity.cover_image) || storage(activity.photos?.[0]?.photo_path);
                            return (
                                <Link key={activity.id} href={`/program/activities/${activity.slug}`} className="campaign-reveal group relative aspect-square overflow-hidden rounded-xl bg-congress-green-deep">
                                    {image ? <img src={image} alt={`${activity.title} gallery image`} className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-white"><PlayCircle className="h-12 w-12" /></div>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-congress-green-deep via-transparent to-transparent" />
                                    <p className="absolute bottom-4 left-4 right-4 font-display text-lg font-black text-white">{activity.title}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <style>{`
                .campaign-reveal {
                    opacity: 0;
                    transform: translateY(18px);
                    transition: opacity 700ms ease, transform 700ms ease;
                }
                .campaign-reveal.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </PublicLayout>
    );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="campaign-reveal rounded-xl border border-dashed border-congress-green-deep/20 bg-white p-8 text-center text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60 md:col-span-full">
            <Icon className="mx-auto h-10 w-10 text-congress-red" />
            <p className="mt-4 font-bold">{text}</p>
        </div>
    );
}

function AdminDataColumn({
    title,
    href,
    items,
}: {
    title: string;
    href: string;
    items: { href: string; title: string; meta: string; icon: any }[];
}) {
    return (
        <div className="campaign-reveal campaign-panel rounded-xl p-5">
            <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-black text-congress-green-deep dark:text-white">{title}</h3>
                <Link href={href} className="text-xs font-black uppercase tracking-[0.16em] text-congress-red">
                    View
                </Link>
            </div>
            <div className="mt-5 grid gap-3">
                {items.length > 0 ? (
                    items.map((item) => (
                        <Link key={`${item.href}-${item.title}`} href={item.href} className="group flex gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-congress-green-deep hover:text-white dark:bg-white/5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-congress-red shadow-sm dark:bg-slate-950">
                                <item.icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="line-clamp-1 block font-black text-slate-900 group-hover:text-white dark:text-white">{item.title}</span>
                                <span className="mt-1 line-clamp-2 block text-sm leading-5 text-slate-500 group-hover:text-white/72 dark:text-white/60">{item.meta || 'Published from admin panel'}</span>
                            </span>
                        </Link>
                    ))
                ) : (
                    <p className="rounded-lg border border-dashed border-congress-green-deep/20 p-4 text-sm font-bold text-slate-500 dark:border-white/10 dark:text-white/60">
                        Add items in the admin panel to publish this section.
                    </p>
                )}
            </div>
        </div>
    );
}
