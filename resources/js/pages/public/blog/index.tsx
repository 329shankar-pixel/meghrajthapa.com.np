import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CalendarDays, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string;
    user?: { name: string };
}

interface Leader {
    social_links: Record<string, string> | null;
}

interface Props {
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
    };
    leader: Leader | null;
}

const formatDate = (date?: string | null) => {
    if (!date) return 'Recent';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

export default function BlogIndex({ posts, leader }: Props) {
    return (
        <PublicLayout
            socialLinks={leader?.social_links ?? undefined}
            title="Articles & Public Voice"
            description="Read campaign articles, public messages, policy notes, and stories from the movement."
        >
            <Head title="Articles & Public Voice" />

            <section className="bg-congress-surface-muted px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto max-w-7xl">
                    <span className="inline-flex items-center gap-2 border-l-4 border-congress-red pl-3 text-xs font-black uppercase tracking-[0.24em] text-congress-red">
                        <BookOpen className="h-4 w-4" />
                        Campaign Journal
                    </span>
                    <div className="mt-6 grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-end">
                        <h1 className="font-display text-5xl font-bold leading-tight text-slate-950 md:text-7xl dark:text-white">
                            Ideas, updates, and messages for every follower.
                        </h1>
                        <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-white/72">
                            Read the campaign position, community stories, and public commitments published from the admin panel.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-congress-surface px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto max-w-7xl">
                    {posts.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <article key={post.id} className="group border border-congress-outline bg-white shadow-[0_24px_80px_-58px_rgba(0,100,0,0.55)] transition duration-500 hover:-translate-y-1 hover:border-congress-red hover:shadow-patriotic dark:border-white/10 dark:bg-slate-950">
                                        <Link href={`/updates/blog/${post.slug}`} className="block">
                                            <div className="aspect-[16/10] border-b border-congress-outline bg-congress-surface-muted p-3 dark:border-white/10 dark:bg-white/5">
                                                {post.featured_image ? (
                                                    <img
                                                        src={`/storage/${post.featured_image}`}
                                                        alt={post.title}
                                                        className="h-full w-full object-contain transition duration-700 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-congress-green-deep/40">
                                                        <BookOpen className="h-12 w-12" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="p-6">
                                            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                                <span className="inline-flex items-center gap-1.5 text-congress-red">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {formatDate(post.published_at)}
                                                </span>
                                                {post.user?.name && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <User className="h-4 w-4" />
                                                        {post.user.name}
                                                    </span>
                                                )}
                                            </div>
                                            <Link href={`/updates/blog/${post.slug}`}>
                                                <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-slate-950 transition group-hover:text-congress-red dark:text-white">
                                                    {post.title}
                                                </h2>
                                            </Link>
                                            {post.excerpt && <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-white/68">{post.excerpt}</p>}
                                            <Link href={`/updates/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-congress-green-deep transition hover:gap-3 hover:text-congress-red dark:text-white">
                                                Read Article
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {posts.last_page > 1 && (
                                <div className="mt-14 flex flex-wrap justify-center gap-2">
                                    {Array.from({ length: posts.last_page }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/updates/blog?page=${page}`}
                                            className={`flex h-11 w-11 items-center justify-center border text-sm font-black transition ${
                                                page === posts.current_page
                                                    ? 'border-congress-green-deep bg-congress-green-deep text-white'
                                                    : 'border-congress-outline bg-white text-congress-green-deep hover:border-congress-red hover:text-congress-red dark:border-white/10 dark:bg-white/5 dark:text-white'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mx-auto max-w-2xl border border-dashed border-congress-outline bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-white/5">
                            <BookOpen className="mx-auto h-12 w-12 text-congress-red" />
                            <h2 className="mt-5 font-display text-3xl font-bold text-congress-green-deep dark:text-white">No articles published yet</h2>
                            <p className="mt-3 text-slate-600 dark:text-white/68">Publish blog posts from the admin panel to show them here.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-congress-green-deep px-4 py-14 text-white md:px-6">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">Stay Connected</p>
                        <h2 className="mt-3 font-display text-4xl font-bold">Follow the ideas. Join the work.</h2>
                    </div>
                    <Link href="/joinnow" className="inline-flex items-center justify-center gap-2 rounded bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-congress-green-deep transition hover:bg-congress-red hover:text-white">
                        Join the Movement
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
