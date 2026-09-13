import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Youtube, ExternalLink, Play, Sparkles, ArrowRight } from 'lucide-react';

interface LeaderVideo {
  id: number;
  title: string;
  youtube_url: string;
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  videos: {
    data: LeaderVideo[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function VideosIndex({ videos, leader }: Props) {
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
  }, [videos.data]);

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Speeches & Broadcasts - Videos">
        <meta name="description" content="Watch the latest speeches, interviews, and public addresses from our movement." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <Youtube className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Video Archives</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">Speeches &</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Broadcasts
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Clarity in vision, strength in voice. Watch all national addresses and community dialogues.
            </p>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {videos.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {videos.data.map((video, i) => {
                  const embedUrl = getYoutubeEmbedUrl(video.youtube_url);
                  return (
                    <div key={video.id} className="fade-in-section group">
                      <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-4 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-800">
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-inner">
                          {embedUrl ? (
                            <iframe
                              className="w-full h-full"
                              src={embedUrl}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-6 text-center">
                              <Video className="w-16 h-16 mb-4" />
                              <p className="font-bold uppercase tracking-widest text-xs">Video Connectivity Error</p>
                              <a
                                href={video.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 flex items-center gap-2 text-[var(--political-red)] bg-white px-6 py-3 rounded-xl font-black text-sm"
                              >
                                WATCH ON YOUTUBE <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="p-8 space-y-4">
                          <div className="flex items-center gap-2 text-[var(--political-red)] font-black uppercase tracking-widest text-[10px]">
                            <Play className="w-3 h-3 fill-current" />
                            Available Now
                          </div>
                          <h3 className="text-2xl font-black text-[var(--political-green)] group-hover:text-[var(--political-red)] transition-colors leading-tight">
                            {video.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {videos.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: videos.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/media/videos?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === videos.current_page
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
                <Youtube className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">No Videos Found</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Coming soon: Exclusive interviews and event highlights.</p>
            </div>
          )}
        </div>
      </section>

      {/* Youtube Channel CTA */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group border border-gray-100 dark:border-gray-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--political-red)]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />

            <div className="space-y-6 text-center md:text-left relative z-10">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Sparkles className="w-5 h-5 text-[var(--political-red)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Exclusive Content</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[var(--political-green)] tracking-tight leading-tight">Subscribe to Our <span className="text-[var(--political-red)]">Channel</span>.</h2>
              <p className="text-xl text-gray-400 dark:text-gray-500 font-medium max-w-lg">Get real-time notifications for live streams and official broadcasts.</p>
            </div>

            <div className="relative z-10">
              <a
                href="#"
                target="_blank"
                className="bg-red-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-red-900/20 hover:bg-red-700 hover:scale-[1.05] transition-all flex items-center gap-4"
              >
                <Youtube className="w-8 h-8" />
                SUBSCRIBE NOW
              </a>
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
