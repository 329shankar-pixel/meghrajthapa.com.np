import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, ExternalLink, Box, ArrowRight, Star, Plus } from 'lucide-react';

interface ResourcePhoto {
  id: number;
  photo: string;
}

interface Resource {
  id: number;
  title: string;
  description: string | null;
  file_path: string | null;
  link: string | null;
  photos?: ResourcePhoto[];
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  resources: {
    data: Resource[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function ResourcesIndex({ resources, leader }: Props) {
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
  }, [resources.data]);

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Knowledge Center - Resources">
        <meta name="description" content="Access policy papers, manifestos, and educational resources from our movement." />
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
              <Box className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Resource Library</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">Knowledge &</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Empowerment
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Access key documents, policy frameworks, and grassroots resources designed to inform and mobilize.
            </p>

            <div className="pt-6 animate-fade-in-up delay-700">
              <Link href="/public-resources/submit">
                <button className="group bg-gray-900 dark:bg-white dark:text-gray-950 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-[var(--political-red)] dark:hover:bg-gray-200 transition-all flex items-center gap-3 mx-auto">
                  SUBMIT A RESOURCE
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {resources.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {resources.data.map((resource, i) => (
                  <div key={resource.id} className="fade-in-section group h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 h-full flex flex-col shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--political-red)]/5 to-transparent rounded-bl-[4rem]" />

                      <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-[var(--political-red)] group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                          <FileText className="w-8 h-8" />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-black text-[var(--political-green)] leading-tight group-hover:text-[var(--political-red)] transition-colors">
                            {resource.title}
                          </h3>
                          {resource.description && (
                            <p className="text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-10 flex flex-col gap-3">
                        {resource.file_path && (
                          <a
                            href={`/storage/${resource.file_path}`}
                            download
                            className="group/btn w-full bg-gray-900 dark:bg-white text-white dark:text-gray-950 px-8 py-4 rounded-2xl font-black text-sm hover:bg-[var(--political-red)] dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                          >
                            <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
                            DOWNLOAD FILE
                          </a>
                        )}
                        {resource.link && (
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white dark:bg-gray-800 text-[var(--political-green)] border-2 border-gray-100 dark:border-gray-700 px-8 py-4 rounded-2xl font-black text-sm hover:border-[var(--political-green)] hover:text-[var(--political-green)] transition-all flex items-center justify-center gap-3"
                          >
                            <ExternalLink className="w-4 h-4" />
                            VISIT SOURCE
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {resources.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: resources.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/public-resources?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === resources.current_page
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
                <FileText className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">Archives Currently Closed</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">We're updating our resource library. Check back soon for new materials.</p>
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
