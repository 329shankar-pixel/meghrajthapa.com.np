import { Head, Link } from '@inertiajs/react';
import React from 'react';
import PublicLayout from '@/layouts/public-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, ChevronLeft, Image as ImageIcon, Camera } from 'lucide-react';

interface ActivityPhoto {
  id: number;
  photo_path: string;
}

interface Activity {
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
  activity: Activity;
  leader: Leader | null;
}

export default function ActivityShow({ activity, leader }: Props) {
  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title={`${activity.title} - Movement Detail`} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 text-center text-balance">
            <Link
              href="/program/activities"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-[var(--political-red)] transition-all group mb-4"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to All Activities
            </Link>

            <h1 className="text-4xl md:text-7xl font-black text-[var(--political-green)] tracking-tight leading-tight">
              {activity.title}
            </h1>

            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Calendar className="w-5 h-5 text-[var(--political-red)]" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-1">Date</p>
                  <p className="font-bold text-[var(--political-green)] leading-none">
                    {activity.date ? new Date(activity.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                  </p>
                </div>
              </div>

              {activity.location && (
                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <MapPin className="w-5 h-5 text-[var(--political-green)]" />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest leading-none mb-1">Location</p>
                    <p className="font-bold text-[var(--political-green)] leading-none truncate max-w-[200px]">{activity.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-16">

            {/* Description & Featured Image */}
            <div className="space-y-12">
              <Card className="rounded-[3rem] border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
                <CardContent className="p-0">
                  {activity.cover_image && (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={`/storage/${activity.cover_image}`}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-10 md:p-16">
                    <div className="prose prose-xl dark:prose-invert max-w-none prose-p:text-gray-500 dark:prose-p:text-gray-400 prose-p:font-medium prose-p:leading-relaxed">
                      {activity.description ? (
                        <div dangerouslySetInnerHTML={{ __html: activity.description }} />
                      ) : (
                        <div className="text-center py-10 opacity-50 italic">Developing the narrative for this local movement...</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Photo Gallery */}
            {activity.photos && activity.photos.length > 0 && (
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--political-red)]/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[var(--political-red)]" />
                  </div>
                  <h2 className="text-3xl font-black text-[var(--political-green)] tracking-tight">On-Ground Captures</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activity.photos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                      <img
                        src={`/storage/${photo.photo_path}`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
