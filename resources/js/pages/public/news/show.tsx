import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Link as LinkIcon, Printer, Newspaper } from 'lucide-react';
import { FaFacebookF, FaXTwitter, FaWhatsapp, FaViber } from 'react-icons/fa6';
import { useState } from 'react';

interface News {
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
  news: News;
  leader: Leader | null;
  partyName?: string;
}

export default function NewsShow({ news, leader, partyName = 'राजनीतिक दल' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(news.title);
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

  return (
    <PublicLayout partyName={partyName} socialLinks={leader?.social_links ?? undefined}>
      <Head>
        <title>{news.meta_title || news.title}</title>
        <meta name="description" content={news.meta_description || news.excerpt || ''} />
      </Head>

      <div className="bg-white dark:bg-gray-950 min-h-screen">
        {/* Hero / Cover Image */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          {news.featured_image ? (
            <img
              src={`/storage/${news.featured_image}`}
              alt={news.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
              <span className="text-gray-400 font-black text-4xl opacity-20 uppercase tracking-tighter">Official Update</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute top-6 left-6 z-10">
            <Link
              href="/updates/news"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16">
            <div className="container mx-auto">
              <div className="max-w-4xl animate-fade-in-up">
                <div className="flex flex-wrap items-center gap-4 text-white/80 font-medium text-sm mb-6">
                  <span className="bg-[var(--political-red)] text-white px-3 py-1 rounded-sm uppercase text-xs font-bold tracking-wider">News</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                  {news.title}
                </h1>
                {news.excerpt && (
                  <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed max-w-3xl">
                    {news.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 md:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar / Social Share */}
            <div className="lg:col-span-1 hidden lg:flex flex-col gap-4 sticky top-32 h-fit">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Share</span>
              <button onClick={() => handleShare('facebook')} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                <FaFacebookF className="w-5 h-5" />
              </button>
              <button onClick={() => handleShare('twitter')} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white transition-all shadow-sm">
                <FaXTwitter className="w-5 h-5" />
              </button>
              <button onClick={() => handleShare('whatsapp')} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                <FaWhatsapp className="w-5 h-5" />
              </button>
              <button onClick={() => handleShare('viber')} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-[#7360F2] hover:text-white transition-all shadow-sm">
                <FaViber className="w-5 h-5" />
              </button>
              <button onClick={handleCopyLink} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm relative group">
                <LinkIcon className="w-5 h-5" />
                {copied && (
                  <span className="absolute left-10 top-1.5 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap">Copied!</span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="lg:col-span-8">
              <article className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[var(--political-red)] max-w-none first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px] first-letter:text-[var(--political-red)]">
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
              </article>

              {/* Tags / Meta if available (Placeholder for now) */}
              <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Tags could go here */}
                  </div>
                  <div className="flex lg:hidden gap-4">
                    <button onClick={() => handleShare('facebook')} className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white">
                      <FaFacebookF className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare('twitter')} className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white">
                      <FaXTwitter className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white">
                      <FaWhatsapp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare('viber')} className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7360F2] text-white">
                      <FaViber className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / More Info */}
            <div className="lg:col-span-3 space-y-8">
              {/* Newsletter / Action */}
              <div className="p-8 rounded-3xl bg-[var(--political-red)] text-white text-center shadow-xl">
                <h3 className="text-xl font-black mb-2">Join the Movement</h3>
                <p className="text-white/80 text-sm mb-6">Stay updated with our latest policies and events.</p>
                <Link href="/joinnow" className="inline-block w-full py-3 bg-white text-[var(--political-red)] font-bold rounded-xl hover:bg-gray-50 transition-colors">
                  Get Involved
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
