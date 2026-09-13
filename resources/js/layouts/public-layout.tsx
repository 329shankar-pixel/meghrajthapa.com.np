import CampaignLogo from '@/components/public/campaign-logo';
import SocialShare from '@/components/public/social-share';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Flag, Globe2, Mail, MapPin, Menu, MessageCircle, Moon, Newspaper, PlayCircle, Send, Sun, UserRound, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FaFacebookF, FaInstagram, FaViber, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';

interface SocialLinks {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    viber?: string;
    website?: string;
}

interface Props {
    children: React.ReactNode;
    partyName?: string;
    socialLinks?: SocialLinks;
    title?: string;
    description?: string;
    image?: string | null;
}

const navLinks = [
    { href: '/', label: 'Home', tone: 'green', icon: Flag },
    { href: '/biography', label: 'About', tone: 'red', icon: UserRound },
    { href: '/#vision', label: 'Vision', tone: 'green', icon: MapPin },
    { href: '/program/activities', label: 'Work', tone: 'red', icon: Users },
    { href: '/updates/news', label: 'News', tone: 'green', icon: Newspaper },
    { href: '/media/galleries', label: 'Gallery', tone: 'red', icon: PlayCircle },
    { href: '/community/resources/submit', label: 'Project', tone: 'green', icon: Send },
];

const footerGroups = [
    {
        title: 'Campaign',
        links: [
            { href: '/', label: 'Home' },
            { href: '/biography', label: 'About the Leader' },
            { href: '/#vision', label: 'Vision & Manifesto' },
            { href: '/joinnow', label: 'Join the Campaign' },
            { href: '/community/resources/submit', label: 'Submit Community Project' },
        ],
    },
    {
        title: 'Updates',
        links: [
            { href: '/updates/news', label: 'News' },
            { href: '/updates/blog', label: 'Blog / Articles' },
            { href: '/program/events', label: 'Events' },
            { href: '/program/activities', label: 'Activities' },
        ],
    },
    {
        title: 'Media',
        links: [
            { href: '/media/galleries', label: 'Photo Gallery' },
            { href: '/media/videos', label: 'Videos' },
            { href: '/media/infographics', label: 'Infographics' },
        ],
    },
];

const normalizeUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('viber:')) return url;
    return `https://${url}`;
};

const buildWhatsappUrl = (phone?: string | null, message = 'Namaste, I want to connect with the campaign.') => {
    if (!phone) return '';
    let normalized = phone.replace(/\D+/g, '');
    if (normalized.length === 10 && normalized.startsWith('9')) {
        normalized = `977${normalized}`;
    }

    return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : '';
};

export default function PublicLayout({ children, socialLinks, title, description, image }: Props) {
    const { name, settings, leader } = usePage<any>().props;
    const partyName = name || 'Nepali Congress';
    const siteName = settings?.party_name || partyName;
    const leaderName = leader?.name || settings?.leader_name || partyName;
    const tagline = settings?.site_tagline || 'लोकतन्त्र, विकास र जनसेवाको अभियान';
    const campaignLabel = settings?.campaign_label || `${partyName} Campaign`;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setDarkMode(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setDarkMode(document.documentElement.classList.contains('dark'));
    };

    const social: Record<string, string | undefined> = socialLinks || leader?.social_links || {};
    const campaignWhatsapp = buildWhatsappUrl(settings?.campaign_whatsapp_number || social.whatsapp || leader?.phone, `Namaste, I want to support ${leaderName}.`);
    const campaignEmail = settings?.campaign_notification_email || settings?.contact_email || leader?.email;
    const socialIcons: Record<string, any> = {
        facebook: FaFacebookF,
        twitter: FaXTwitter,
        instagram: FaInstagram,
        youtube: FaYoutube,
        whatsapp: FaWhatsapp,
        viber: FaViber,
        website: Globe2,
    };

    const meta = useMemo(() => {
        const pageTitle = title || `${leaderName} | ${partyName}`;
        const pageDescription = description || `${tagline}. A modern Nepali Congress campaign platform for updates, vision, achievements, galleries, and volunteer action.`;
        const pageImage = image
            ? image
            : settings?.og_image
              ? `/storage/${settings.og_image}`
              : settings?.site_logo
                ? `/storage/${settings.site_logo}`
                : leader?.image
                  ? `/storage/${leader.image}`
                  : '/logo.svg';

        return { pageTitle, pageDescription, pageImage };
    }, [description, image, leader?.image, leaderName, partyName, settings?.og_image, settings?.site_logo, tagline, title]);

    return (
        <div className="public-site min-h-screen overflow-x-hidden bg-[#fffdf8] font-sans text-slate-950 selection:bg-congress-red selection:text-white dark:bg-slate-950 dark:text-white">
            <Head title={meta.pageTitle}>
                <meta name="description" content={meta.pageDescription} />
                <meta property="og:title" content={meta.pageTitle} />
                <meta property="og:description" content={meta.pageDescription} />
                <meta property="og:image" content={meta.pageImage} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={partyName} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={meta.pageTitle} />
                <meta name="twitter:description" content={meta.pageDescription} />
                <meta name="twitter:image" content={meta.pageImage} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Person',
                        name: leaderName,
                        affiliation: { '@type': 'PoliticalParty', name: partyName },
                        image: meta.pageImage,
                        description: meta.pageDescription,
                        sameAs: Object.values(social).filter(Boolean),
                    })}
                </script>
            </Head>

            <div className="h-1.5 bg-congress-stripe" />

            <header
                className={`sticky top-0 z-40 transition duration-300 ${
                    scrolled
                        ? 'bg-white/88 shadow-[0_22px_80px_-48px_rgba(0,100,0,0.75)] backdrop-blur-2xl dark:bg-slate-950/88'
                        : 'bg-white/96 dark:bg-slate-950/96'
                }`}
            >
                <div className="mx-auto max-w-7xl px-3 py-3 md:px-6">
                    <div className="hidden items-center justify-between rounded-t-2xl border border-b-0 border-congress-green-deep/10 bg-congress-green-deep px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-sm lg:flex">
                        <div className="flex min-w-0 items-center gap-2">
                            <Flag className="h-3.5 w-3.5" />
                            <span className="truncate">{tagline}</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/82">
                            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Province to Ward Action</span>
                            <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Cadres & Volunteers</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-congress-green-deep/10 bg-white/94 shadow-[0_18px_70px_-48px_rgba(7,95,52,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92 lg:rounded-t-none">
                        <div className="grid items-center gap-3 px-3 py-3 lg:grid-cols-[minmax(190px,0.7fr)_minmax(0,1.55fr)_auto] lg:px-4">
                            <div className="flex min-w-0 items-center justify-between gap-3">
                                <CampaignLogo
                                    partyName={siteName}
                                    brandName={siteName}
                                    leaderName={leaderName}
                                    leaderImage={leader?.image}
                                    logo={settings?.site_logo || settings?.party_flag}
                                    campaignLabel={campaignLabel}
                                    showImage={false}
                                    compact
                                />
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen((open) => !open)}
                                    aria-label="Open menu"
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-congress-green-deep text-white shadow-campaign lg:hidden"
                                >
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>

                            <nav className="hidden min-w-0 items-center justify-center rounded-xl bg-[#f4faf5] p-1.5 ring-1 ring-congress-green-deep/5 dark:bg-white/5 dark:ring-white/10 lg:flex">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`group relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-3.5 py-2.5 text-[13px] font-black text-slate-700 transition hover:-translate-y-0.5 hover:text-white dark:text-white/78 xl:px-4 ${
                                            link.tone === 'red' ? 'hover:bg-congress-red' : 'hover:bg-congress-green-deep'
                                        }`}
                                    >
                                        <link.icon className="h-3.5 w-3.5" />
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="hidden items-center justify-end gap-2 lg:flex">
                                {campaignWhatsapp && (
                                    <a
                                        href={campaignWhatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-congress-green-deep px-4 text-xs font-black uppercase tracking-[0.14em] text-white shadow-campaign transition hover:-translate-y-0.5 hover:bg-congress-red"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleDarkMode}
                                    aria-label="Toggle dark mode"
                                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-congress-green-deep/10 text-congress-green-deep transition hover:bg-congress-green-deep hover:text-white dark:border-white/10 dark:text-white"
                                >
                                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </button>
                                <Link
                                    href="/joinnow"
                                    className="inline-flex h-11 items-center rounded-xl bg-congress-red px-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-patriotic transition hover:-translate-y-0.5 hover:bg-congress-green-deep"
                                >
                                    Join
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-congress-green-deep/10 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950 lg:hidden">
                        <div className="grid gap-1 p-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between rounded-2xl px-4 py-3 font-black text-slate-800 hover:bg-congress-green-deep/5 dark:text-white"
                                >
                                    <span className="inline-flex items-center gap-3">
                                        <link.icon className="h-4 w-4 text-congress-red" />
                                        {link.label}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-congress-red" />
                                </Link>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-congress-green-deep/10 p-3 dark:border-white/10">
                            {campaignWhatsapp && (
                                <a href={campaignWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-congress-green-deep px-4 py-3 text-sm font-black text-white">
                                    <MessageCircle className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            )}
                            <Link href="/joinnow" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center rounded-2xl bg-congress-red px-4 py-3 text-sm font-black text-white">
                                Join
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main>{children}</main>

            <footer className="relative overflow-hidden bg-congress-green-deep text-white">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-congress-stripe" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,95,52,0.98),rgba(7,95,52,0.9)_55%,rgba(210,31,50,0.8))]" />
                <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6">
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr_0.9fr]">
                        <div>
                            <CampaignLogo
                                partyName={partyName}
                                leaderName={leaderName}
                                leaderImage={leader?.image}
                                logo={settings?.site_logo || settings?.party_flag}
                                campaignLabel={campaignLabel}
                                inverse
                            />
                            <p className="mt-5 max-w-md font-nepali text-sm font-semibold leading-7 text-white">{tagline}</p>
                            <div className="mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-white">
                                <div className="h-full w-full bg-congress-stripe" />
                            </div>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-3">
                            {footerGroups.map((group) => (
                                <div key={group.title}>
                                    <h3 className="font-display text-lg font-black">{group.title}</h3>
                                    <div className="mt-5 grid gap-3 text-sm font-semibold text-white/75">
                                        {group.links.map((link) => (
                                            <Link key={link.href} href={link.href} className="transition hover:text-white hover:translate-x-1">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="font-display text-lg font-black">Contact & Social</h3>
                            <div className="mt-5 grid gap-3 text-sm font-semibold text-white/78">
                                {campaignEmail && (
                                    <a href={`mailto:${campaignEmail}`} className="inline-flex items-center gap-2 transition hover:text-white">
                                        <Mail className="h-4 w-4" />
                                        {campaignEmail}
                                    </a>
                                )}
                                {campaignWhatsapp && (
                                    <a href={campaignWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp Campaign
                                    </a>
                                )}
                                {settings?.campaign_office_address && (
                                    <span className="inline-flex items-start gap-2">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                        {settings.campaign_office_address}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {Object.entries(social).map(([platform, url]) => {
                                    if (!url) return null;
                                    const Icon = socialIcons[platform] || Globe2;
                                    return (
                                        <a
                                            key={platform}
                                            href={normalizeUrl(url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={platform}
                                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-congress-green-deep transition hover:-translate-y-1 hover:bg-congress-red hover:text-white"
                                        >
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative border-t border-white/10 px-4 py-5 text-center text-sm text-white/65">
                    © {new Date().getFullYear()} {partyName}. All rights reserved.
                </div>
            </footer>

            <SocialShare title={meta.pageTitle} description={meta.pageDescription} floating />
        </div>
    );
}
