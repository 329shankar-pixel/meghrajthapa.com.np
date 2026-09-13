import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Images, X, ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';

interface Photo {
  id: number;
  photo_path: string;
}

interface Category {
  id: number;
  name: string;
}

interface Gallery {
  id: number;
  title: string;
  description: string | null;
  cover_image: string | null;
  leader_category_id: number | null;
  category?: Category;
  photos: Photo[];
}

interface Leader {
  social_links: Record<string, string> | null;
}

interface Props {
  galleries: {
    data: Gallery[];
    links: any;
    current_page: number;
    last_page: number;
  };
  categories: Category[];
  leader: Leader | null;
  filters?: {
    category_id?: string | number;
  };
}

export default function GalleriesIndex({ galleries, categories, leader, filters }: Props) {
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const selectedCategoryId = filters?.category_id || 'all';

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
  }, [galleries.data, selectedCategoryId]);

  const openLightbox = (gallery: Gallery, index: number = 0) => {
    setSelectedGallery(gallery);
    setSelectedPhotoIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedGallery(null);
    setSelectedPhotoIndex(0);
    document.body.style.overflow = 'unset';
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedGallery && selectedPhotoIndex < selectedGallery.photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  return (
    <PublicLayout socialLinks={leader?.social_links ?? undefined}>
      <Head title="Visual History - Photo Galleries">
        <meta name="description" content="Explore our photo galleries and witness the impact of our movement." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto animate-fade-in-up">
              <Images className="w-4 h-4 text-[var(--political-red)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Captured Moments</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-[var(--political-green)] tracking-tight">
              <span className="block overflow-hidden">
                <span className="block animate-reveal-text">Visual</span>
              </span>
              <span className="block overflow-hidden italic">
                <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                  Testimonials
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-500">
              A testament to our struggles, triumphs, and the unbreakable bond with the people.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900 sticky top-20 z-20 overflow-x-auto no-scrollbar">
        <div className="container mx-auto px-6 py-4 flex items-center justify-center gap-4 min-w-max">
          <Link
            href="/media/galleries?category_id=all"
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategoryId === 'all'
              ? 'bg-[var(--political-red)] text-white shadow-lg scale-105'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
          >
            All Moments
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/media/galleries?category_id=${category.id}`}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${Number(selectedCategoryId) === category.id
                ? 'bg-[var(--political-red)] text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Galleries Grid */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          {galleries.data.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {galleries.data
                  .map((gallery, i) => (
                    <div key={gallery.id} className="fade-in-section group" onClick={() => openLightbox(gallery)}>
                      <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-700 cursor-pointer bg-white dark:bg-gray-800 border-8 border-white dark:border-gray-900">
                        {gallery.cover_image ? (
                          <img
                            src={`/storage/${gallery.cover_image}`}
                            alt={gallery.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : gallery.photos[0] ? (
                          <img
                            src={`/storage/${gallery.photos[0].photo_path}`}
                            alt={gallery.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Images className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
                            <ImageIcon className="w-8 h-8 text-[var(--political-red)]" />
                          </div>
                          <span className="text-white font-black uppercase tracking-widest text-xs">Explore Gallery</span>
                        </div>

                        {/* Photo count badge */}
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--political-green)] shadow-xl flex items-center gap-2 border border-white/20">
                            <Star className="w-3 h-3 text-[var(--political-red)]" />
                            {gallery.photos.length} Photos
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 space-y-3 px-2 text-center">
                        {gallery.category && (
                          <div className="inline-block px-3 py-1 bg-[var(--political-red)]/10 text-[var(--political-red)] rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                            {gallery.category.name}
                          </div>
                        )}
                        <h3 className="text-2xl font-black text-[var(--political-green)] group-hover:text-[var(--political-red)] transition-colors leading-tight">
                          {gallery.title}
                        </h3>
                        {gallery.description && (
                          <p className="text-gray-400 dark:text-gray-500 font-medium line-clamp-1 text-sm">{gallery.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {galleries.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-gray-100 dark:border-gray-800">
                  {Array.from({ length: galleries.last_page }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/media/galleries?page=${page}${selectedCategoryId !== 'all' ? `&category_id=${selectedCategoryId}` : ''}`}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${page === galleries.current_page
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
                <Images className="w-10 h-10 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-2xl font-black text-[var(--political-green)]">No Galleries Found</h3>
              <p className="text-gray-400 dark:text-gray-500 font-medium">Memories are being curated. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedGallery && selectedGallery.photos.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 rounded-full bg-white/5 hover:bg-white/10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="container mx-auto px-4 flex items-center justify-center relative h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={prevPhoto}
              disabled={selectedPhotoIndex === 0}
              className="absolute left-8 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all disabled:opacity-0"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div className="max-w-5xl h-[75vh] relative flex items-center justify-center">
              <img
                src={`/storage/${selectedGallery.photos[selectedPhotoIndex].photo_path}`}
                alt={`${selectedGallery.title} - Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
              />

              {/* Info Overlay */}
              <div className="absolute -bottom-16 inset-x-0 text-center space-y-2">
                <span className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">
                  {selectedPhotoIndex + 1} of {selectedGallery.photos.length} — {selectedGallery.title}
                </span>
              </div>
            </div>

            <button
              onClick={nextPhoto}
              disabled={selectedPhotoIndex === selectedGallery.photos.length - 1}
              className="absolute right-8 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all disabled:opacity-0"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
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
