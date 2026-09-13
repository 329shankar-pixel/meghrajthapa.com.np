import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon, BarChart3, Download, X, Search, ArrowRight, Share2, Link as LinkIcon } from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaWhatsapp, FaViber } from 'react-icons/fa6';

interface Infographic {
  id: number;
  title: string;
  photo: string;
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  infographics: {
    data: Infographic[];
    links: any;
    current_page: number;
    last_page: number;
  };
  leader: Leader | null;
}

export default function InfographicsIndex({ infographics, leader }: Props) {
  const [selectedImage, setSelectedImage] = useState<Infographic | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (infographic?: Infographic) => {
    const url = infographic ? `${window.location.origin}/media/infographics?id=${infographic.id}` : window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string, infographic: Infographic) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this infographic: ${infographic.title}`);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://x.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'viber':
        shareUrl = `viber://forward?text=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

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
  }, [infographics.data]);

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Vision in Data - Infographics">
        <meta name="description" content="Explore our visual representations of national progress, policy data, and future goals." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <BarChart3 className="w-4 h-4 text-[var(--political-green)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Visual Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">
                  <span className="text-[var(--political-red)]">Data-Driven</span>
                </span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200">
                  Progress
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              Simplifying complex issues through clear, visual storytelling. Understanding our nation's potential through data.
            </p>
          </div>
        </div>
      </section>

      {/* Infographics Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {infographics.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {infographics.data.map((infographic, i) => (
                  <div
                    key={infographic.id}
                    className="fade-in-section group cursor-pointer"
                    onClick={() => setSelectedImage(infographic)}
                  >
                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-700 bg-white dark:bg-gray-800 border-8 border-white dark:border-gray-900">
                      <img
                        src={`/storage/${infographic.photo}`}
                        alt={infographic.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                          <Search className="w-6 h-6 text-[var(--political-red)]" />
                        </div>
                        <span className="text-white font-black uppercase tracking-widest text-[10px]">Maximize Information</span>
                      </div>
                    </div>

                    <div className="mt-6 px-4 space-y-2">
                      <h3 className="text-lg font-black text-[var(--political-green)] group-hover:text-[var(--political-green)] transition-colors line-clamp-2 leading-tight">
                        {infographic.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {infographics.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: infographics.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/media/infographics?page=${page}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === infographics.current_page
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
                <BarChart3 className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">No Visual Data Yet</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">We're currently visualizing our latest achievements. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="container mx-auto px-4 flex flex-col items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-4xl max-h-[75vh] w-full relative flex items-center justify-center">
              <img
                src={`/storage/${selectedImage.photo}`}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
              />
            </div>

            <div className="mt-12 text-center space-y-6 max-w-2xl px-6 fade-in-section is-visible">
              <h3 className="text-2xl font-black text-white leading-tight">{selectedImage.title}</h3>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <a
                  href={`/storage/${selectedImage.photo}`}
                  download
                  className="inline-flex items-center gap-4 bg-white text-gray-900 px-8 py-4 rounded-[2rem] font-black text-xs shadow-2xl transition-all hover:bg-gray-50"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD
                </a>

                <div className="flex items-center gap-2 px-2">
                  <button onClick={() => handleShare('facebook', selectedImage)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all border border-white/10">
                    <FaFacebookF className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare('twitter', selectedImage)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-black text-white flex items-center justify-center transition-all border border-white/10">
                    <FaXTwitter className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare('whatsapp', selectedImage)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all border border-white/10">
                    <FaWhatsapp className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare('viber', selectedImage)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#7360F2] text-white flex items-center justify-center transition-all border border-white/10">
                    <FaViber className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleCopyLink()} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all border border-white/10 relative">
                    <LinkIcon className="w-5 h-5" />
                    {copied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap">Copied!</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
