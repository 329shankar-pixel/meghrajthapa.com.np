import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, CalendarDays, ArrowRight, Star } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  content: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cover_image: string | null;
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  events: {
    data: Event[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function EventsIndex({ events, leader }: Props) {
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
  }, [events.data]);

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Upcoming Events & Programs">
        <meta name="description" content="Join our upcoming events and be part of the movement for change." />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-20 dark:bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <CalendarDays className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Community Outreach</span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-[var(--political-green)] md:text-8xl dark:text-white">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">Events &</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Gatherings
                </span>
              </span>
            </h1>
            <p className="mx-auto max-w-2xl animate-fade-in-up text-xl leading-relaxed text-slate-600 delay-500 md:text-2xl dark:text-white/75">
              Direct engagement with the people is at the heart of our mission. Find out where we'll be next.
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="bg-gray-50/50 py-20 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          {events.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {events.data.map((event, i) => (
                  <div key={event.id} className="fade-in-section group">
                    <Link href={`/program/events/${event.id}`} className="block space-y-8">
                      <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                        {event.cover_image ? (
                          <img
                            src={`/storage/${event.cover_image}`}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--political-red)]/10 to-[var(--political-green)]/10 dark:from-[var(--political-red)]/20 dark:to-[var(--political-green)]/20 flex items-center justify-center">
                            <CalendarDays className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--political-green)] shadow-xl">
                            {new Date(event.event_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 px-2">
                        <h3 className="text-2xl font-black leading-tight text-[var(--political-green)] transition-colors group-hover:text-[var(--political-red)] dark:text-white dark:group-hover:text-[var(--political-red-light)]">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600 dark:text-white/70">
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[var(--political-red)]" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {(event.start_time || event.end_time) && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[var(--political-green)]" />
                              <span>
                                {formatTime(event.start_time)}
                                {event.end_time && ` - ${formatTime(event.end_time)}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {event.content && (
                          <p className="line-clamp-2 font-medium leading-relaxed text-slate-600 dark:text-white/70" dangerouslySetInnerHTML={{ __html: event.content }} />
                        )}

                        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--political-red)] hover:gap-4 transition-all pt-2">
                          Volunteer & Read More
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {events.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: events.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/program/events?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === events.current_page
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
                <CalendarDays className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)] dark:text-white">No Events Scheduled</h3>
              <p className="font-medium text-slate-600 dark:text-white/70">We are currently planning our next gatherings. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="bg-gray-900 dark:bg-black rounded-[4rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden group border border-gray-800">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--political-red)]/10 via-transparent to-[var(--political-green)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">Can't Find an <span className="text-[var(--political-red-light)] italic">Event</span> Near You?</h2>
              <p className="text-xl text-white/50 font-medium">Submit a request to host a gathering in your locality or join our volunteer network.</p>
              <div className="pt-6">
                <Link
                  href="/joinnow"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-[1.05] transition-all"
                >
                  BECOME A VOLUNTEER
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
