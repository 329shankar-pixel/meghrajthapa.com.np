import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight, Newspaper, ArrowRight, Star } from 'lucide-react';

interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  news: {
    data: News[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function NewsIndex({ news, leader }: Props) {
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
  }, [news.data]);

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Latest News & Updates">
        <meta name="description" content="Stay updated with the latest news and announcements from our movement." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <Newspaper className="w-4 h-4 text-[var(--political-green)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Official Updates</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">News &</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Perspectives
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Direct insights into our progress, policy discussions, and the impact we are making across the nation.
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {news.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {news.data.map((article, i) => (
                  <div
                    key={article.id}
                    className="fade-in-section group"
                  >
                    <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                      {article.featured_image ? (
                        <img
                          src={`/storage/${article.featured_image}`}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--political-green)] shadow-xl">
                          {new Date(article.published_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 px-2">
                      <h3 className="text-2xl font-black text-[var(--political-green)] group-hover:text-[var(--political-red)] transition-colors leading-tight">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-400 dark:text-gray-500 font-medium line-clamp-2 leading-relaxed">{article.excerpt}</p>
                      )}
                      <Link
                        href={`/updates/news/${article.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--political-red)] hover:gap-4 transition-all"
                      >
                        Read Full Story
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {news.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: news.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/updates/news?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === news.current_page
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950 shadow-xl scale-110'
                        : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800'
                        }`}
                    >
                      {page}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-xl mx-auto text-center py-32 space-y-6 bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 fade-in-section">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">No Articles Found</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">We haven't posted any updates yet. Please check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[var(--political-green)] to-[var(--political-green-dark)] rounded-[4rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Never Miss an Update.</h2>
              <p className="text-xl text-white/70 font-medium">Get the latest news and calls to action delivered straight to your inbox.</p>
              <div className="pt-6">
                <Link
                  href="/joinnow"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-[1.05] transition-all"
                >
                  STAY CONNECTED
                  <ArrowRight className="w-6 h-6" />
                </Link>
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
