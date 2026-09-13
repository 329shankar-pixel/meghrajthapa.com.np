import { Share2 } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaViber, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

interface SocialShareProps {
    title: string;
    description?: string;
    image?: string | null;
    floating?: boolean;
}

const currentUrl = () => (typeof window === 'undefined' ? '' : window.location.href);

export default function SocialShare({ title, description = '', floating = false }: SocialShareProps) {
    const url = currentUrl();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title}${description ? ` - ${description}` : ''}`);

    const links = [
        { label: 'Facebook', icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
        { label: 'X', icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
        { label: 'WhatsApp', icon: FaWhatsapp, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
        { label: 'Viber', icon: FaViber, href: `viber://forward?text=${encodedText}%20${encodedUrl}` },
        { label: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/' },
    ];

    if (floating) {
        return (
            <div className="fixed bottom-24 right-3 z-50 md:bottom-auto md:right-auto md:left-4 md:top-1/2 md:-translate-y-1/2">
                <div className="flex items-center gap-2 rounded-full border border-congress-green-deep/10 bg-white/95 p-2 shadow-2xl shadow-congress-green-deep/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92 md:flex-col md:rounded-3xl">
                    <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-congress-red text-white md:flex" aria-label="Share this page">
                        <Share2 className="h-4 w-4" />
                    </span>
                    {links.map(({ label, icon: Icon, href }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Share on ${label}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-congress-green-deep text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-congress-red hover:shadow-patriotic"
                        >
                            <Icon className="h-4 w-4" />
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-congress-green-deep/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-congress-green-deep shadow-sm">
                <Share2 className="h-3.5 w-3.5" />
                Share
            </span>
            {links.map(({ label, icon: Icon, href }) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${label}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-congress-green-deep text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-congress-red hover:shadow-patriotic"
                >
                    <Icon className="h-4 w-4" />
                </a>
            ))}
        </div>
    );
}
