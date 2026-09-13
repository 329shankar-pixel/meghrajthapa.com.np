import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, Link as LinkIcon, Printer, Share2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { FaFacebookF, FaViber, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    published_at: string;
    meta_title?: string;
    meta_description?: string;
}

interface Leader {
    id: number;
    name: string;
    image: string | null;
    social_links: Record<string, string> | null;
}

interface Props {
    post: Post;
    leader: Leader | null;
    partyName?: string;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'Recent';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat('en', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

export default function BlogShow({ post, leader, partyName = 'Nepali Congress' }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: string) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(post.title);
        const shareUrls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://x.com/intent/tweet?url=${url}&text=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            viber: `viber://forward?text=${text}%20${url}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <PublicLayout
            partyName={partyName}
            socialLinks={leader?.social_links ?? undefined}
            title={post.meta_title || post.title}
            description={post.meta_description || post.excerpt || post.title}
            image={post.featured_image ? `/storage/${post.featured_image}` : undefined}
        >
            <Head title={post.meta_title || post.title} />

            <article className="bg-congress-surface dark:bg-slate-950">
                <section className="bg-congress-surface-muted px-4 py-10 md:px-6 md:py-16">
                    <div className="mx-auto max-w-7xl">
                        <Link href="/updates/blog" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:text-congress-red dark:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Articles
                        </Link>

                        <div className="mt-8 grid gap-10 lg:grid-cols-[0.84fr_1fr] lg:items-center">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-congress-red">
                                    <span>Campaign Article</span>
                                    <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-white/60">
                                        <CalendarDays className="h-4 w-4" />
                                        {formatDate(post.published_at)}
                                    </span>
                                </div>
                                <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-slate-950 md:text-6xl dark:text-white">{post.title}</h1>
                                {post.excerpt && <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-white/72">{post.excerpt}</p>}
                            </div>

                            <div className="border border-congress-outline bg-white p-3 shadow-campaign dark:border-white/10 dark:bg-white/5">
                                <div className="aspect-[16/10] bg-congress-surface-muted dark:bg-slate-950">
                                    {post.featured_image ? (
                                        <img src={`/storage/${post.featured_image}`} alt={post.title} className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-center text-3xl font-black uppercase tracking-[0.22em] text-congress-green-deep/20">
                                            Campaign Article
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 py-14 md:px-6 md:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[72px_minmax(0,1fr)_300px]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-32 grid gap-3">
                                <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-slate-400">Share</p>
                                <ShareButton label="Facebook" onClick={() => handleShare('facebook')}>
                                    <FaFacebookF className="h-5 w-5" />
                                </ShareButton>
                                <ShareButton label="X" onClick={() => handleShare('twitter')}>
                                    <FaXTwitter className="h-5 w-5" />
                                </ShareButton>
                                <ShareButton label="WhatsApp" onClick={() => handleShare('whatsapp')}>
                                    <FaWhatsapp className="h-5 w-5" />
                                </ShareButton>
                                <ShareButton label="Viber" onClick={() => handleShare('viber')}>
                                    <FaViber className="h-5 w-5" />
                                </ShareButton>
                                <ShareButton label="Copy link" onClick={handleCopyLink}>
                                    <LinkIcon className="h-5 w-5" />
                                </ShareButton>
                                {copied && <p className="text-center text-xs font-bold text-congress-red">Copied</p>}
                            </div>
                        </aside>

                        <div className="border border-congress-outline bg-white p-6 shadow-[0_24px_80px_-58px_rgba(0,100,0,0.55)] dark:border-white/10 dark:bg-slate-950 md:p-10">
                            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-congress-green-deep prose-p:leading-8 prose-p:text-slate-700 prose-a:text-congress-red prose-img:mx-auto prose-img:max-h-[720px] prose-img:w-auto prose-img:object-contain dark:prose-invert dark:prose-p:text-white/72">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-congress-outline pt-6 dark:border-white/10">
                                <div className="flex gap-2 lg:hidden">
                                    <ShareButton label="Facebook" onClick={() => handleShare('facebook')}>
                                        <FaFacebookF className="h-5 w-5" />
                                    </ShareButton>
                                    <ShareButton label="WhatsApp" onClick={() => handleShare('whatsapp')}>
                                        <FaWhatsapp className="h-5 w-5" />
                                    </ShareButton>
                                    <ShareButton label="Copy link" onClick={handleCopyLink}>
                                        <LinkIcon className="h-5 w-5" />
                                    </ShareButton>
                                </div>
                                <button onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:text-congress-red dark:text-white">
                                    <Printer className="h-4 w-4" />
                                    Print
                                </button>
                            </div>
                        </div>

                        <aside>
                            <div className="sticky top-32 border border-congress-outline bg-congress-green-deep p-7 text-white shadow-campaign dark:border-white/10">
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Join the Movement</p>
                                <h2 className="mt-3 font-display text-3xl font-bold">Your support makes this message stronger.</h2>
                                <p className="mt-4 text-sm leading-7 text-white/75">Stay connected with campaign updates, programs, and public commitments.</p>
                                <Link href="/joinnow" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:bg-congress-red hover:text-white">
                                    Get Involved
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </section>
            </article>
        </PublicLayout>
    );
}

function ShareButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center border border-congress-outline bg-white text-congress-green-deep transition hover:border-congress-red hover:bg-congress-red hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
            {children}
        </button>
    );
}
