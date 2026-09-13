import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Image as ImageIcon, Activity, ArrowRight, Star } from 'lucide-react';

interface ActivityPhoto {
  id: number;
  photo_path: string;
}

interface ActivityItem {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  date: string | null;
  location: string | null;
  cover_image: string | null;
  photos?: ActivityPhoto[];
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  activities: {
    data: ActivityItem[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function ActivitiesIndex({ activities, leader }: Props) {
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
  }, [activities.data]);

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Direct Action - Activities">
        <meta name="description" content="Witness our community engagements, social initiatives, and direct actions on the ground." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <Activity className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Service in Action</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">Grassroots</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Engagement
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Changing lives one community at a time. Explore our latest social programs and local initiatives.
            </p>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {activities.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {activities.data.map((activity, i) => (
                  <Link key={activity.id} href={`/program/activities/${activity.slug}`} className="fade-in-section group h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-4 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                      <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-inner bg-gray-50 dark:bg-gray-800">
                        {activity.cover_image || (activity.photos && activity.photos.length > 0) ? (
                          <img
                            src={`/storage/${activity.cover_image || activity.photos?.[0].photo_path}`}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Activity className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                          </div>
                        )}

                        {/* Date Overlay */}
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--political-green)] shadow-xl border border-white/10">
                            {activity.date ? new Date(activity.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : 'Recent'}
                          </span>
                        </div>

                        {activity.photos && activity.photos.length > 0 && (
                          <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-2">
                            <ImageIcon className="w-3 h-3" />
                            {activity.photos.length} Gallery Photos
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-[0.2em]">
                          {activity.location && (
                            <span className="truncate max-w-[150px]">{activity.location}</span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black text-[var(--political-green)] group-hover:text-[var(--political-red)] transition-colors leading-tight">
                          {activity.title}
                        </h3>

                        {activity.description && (
                          <div
                            className="text-gray-400 dark:text-gray-500 font-medium line-clamp-3 leading-relaxed flex-1 prose-sm dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: activity.description }}
                          />
                        )}

                        <div className="pt-4 flex items-center gap-3 group/link">
                          <div className="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:w-24 group-hover:bg-[var(--political-red)] transition-all duration-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-transparent group-hover:text-[var(--political-red)] transition-all">Read More</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {activities.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: activities.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/program/activities?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === activities.current_page
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
                <Activity className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">No Activities Logged</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Our groundwork continues. New activity reports are being prepared.</p>
            </div>
          )}
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
