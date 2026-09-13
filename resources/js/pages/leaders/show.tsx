import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import React, { useEffect } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  Smartphone,
  Star,
  Zap,
  ArrowRight,
  User,
  Quote as QuoteIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Quote {
  id: number;
  quote: string;
  image: string | null;
}

interface Infographic {
  id: number;
  title: string;
  description: string | null;
  photo: string;
}

interface Leader {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  slug: string;
  image: string | null;
  bio: string | null;
  social_links: Record<string, string> | null;
  quotes: Quote[];
  infographics: Infographic[];
}

interface Props {
  leader: Leader;
}

export default function Show({ leader }: Props) {
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
  }, []);

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    website: Globe,
    whatsapp: MessageCircle,
    viber: Phone,
  };

  return (
    <PublicLayout socialLinks={leader.social_links ?? undefined}>
      <Head title={`${leader.name} - Official Profile`} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[var(--political-red)]/5 dark:bg-[var(--political-red)]/10 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] bg-[var(--political-green)]/5 dark:bg-[var(--political-green)]/10 rounded-full blur-[100px] animate-float-slow delay-1000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
            {/* Profile Image */}
            <div className="relative group fade-in-section">
              <div className="absolute -inset-4 bg-gradient-to-br from-[var(--political-red)] to-[var(--political-green)] rounded-full opacity-20 dark:opacity-40 blur-2xl group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity duration-1000" />
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-[12px] border-white dark:border-gray-900 shadow-2xl">
                {leader.image ? (
                  <img
                    src={`/storage/${leader.image}`}
                    alt={leader.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <User className="w-24 h-24 text-gray-200 dark:text-gray-700" />
                  </div>
                )}
              </div>

              {/* Floating Medal */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex items-center justify-center animate-bounce-slow border border-gray-100 dark:border-gray-800">
                <Star className="w-10 h-10 text-[var(--political-red)] fill-[var(--political-red)]" />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center md:text-left space-y-8 max-w-2xl">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-2xl w-fit mx-auto md:mx-0 animate-fade-in-up">
                <Zap className="w-4 h-4 text-[var(--political-green)]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Official Leader Profile</span>
              </div>

              <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                <span className="block overflow-hidden">
                  <span className="block animate-reveal-text">Voices for</span>
                </span>
                <span className="block overflow-hidden italic">
                  <span className="block animate-reveal-text delay-200 text-transparent bg-clip-text bg-gradient-to-r from-[var(--political-red)] to-[var(--political-red-dark)]">
                    {leader.name}
                  </span>
                </span>
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 animate-fade-in-up delay-500">
                {leader.email && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-400 dark:text-gray-500">
                    <Mail className="w-4 h-4 text-[var(--political-red)]" />
                    {leader.email}
                  </div>
                )}
                {leader.phone && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-400 dark:text-gray-500">
                    <Smartphone className="w-4 h-4 text-[var(--political-green)]" />
                    {leader.phone}
                  </div>
                )}
              </div>

              {leader.social_links && (
                <div className="flex flex-wrap justify-center md:justify-start gap-4 animate-fade-in-up delay-700">
                  {Object.entries(leader.social_links).map(([platform, url], i) => {
                    if (!url) return null;
                    const Icon = socialIcons[platform] || Globe;
                    return (
                      <a
                        key={platform}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-[var(--political-red)] hover:text-white dark:hover:text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        title={platform}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Details Sections */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-32">

            {/* Biography */}
            <div className="fade-in-section space-y-10">
              <div className="flex items-center gap-4">
                <User className="w-8 h-8 text-[var(--political-red)]" />
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Biography</h2>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-16 shadow-lg border border-gray-100 dark:border-gray-800">
                <div
                  className="prose prose-xl dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-black prose-p:text-gray-400 dark:prose-p:text-gray-500 prose-p:font-medium prose-p:leading-relaxed prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-black"
                  dangerouslySetInnerHTML={{ __html: leader.bio || '<p>No biography available at this moment.</p>' }}
                />
              </div>
            </div>

            {/* Infographics */}
            {leader.infographics && leader.infographics.length > 0 && (
              <div className="fade-in-section space-y-10">
                <div className="flex items-center gap-4">
                  <Zap className="w-8 h-8 text-[var(--political-green)]" />
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Key Achievements</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {leader.infographics.map((item) => (
                    <div key={item.id} className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-gray-100 dark:border-gray-800">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
                        <img
                          src={`/storage/${item.photo}`}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-8 space-y-4">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-[var(--political-red)] transition-colors leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-400 dark:text-gray-500 font-medium text-sm leading-relaxed truncate group-hover:whitespace-normal group-hover:line-clamp-none">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quotes */}
            {leader.quotes && leader.quotes.length > 0 && (
              <div className="fade-in-section space-y-10">
                <div className="flex items-center gap-4">
                  <QuoteIcon className="w-8 h-8 text-[var(--political-red)]" />
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Words of Wisdom</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {leader.quotes.map((quote) => (
                    <div key={quote.id} className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--political-red)]/5 dark:bg-gradient-to-bl dark:from-[var(--political-red)]/10 to-transparent rounded-bl-[4rem]" />
                      <div className="space-y-8 relative z-10">
                        <blockquote className="text-2xl italic font-black text-gray-400 dark:text-gray-500 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          "{quote.quote}"
                        </blockquote>
                        {quote.image && (
                          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
                            <img
                              src={`/storage/${quote.image}`}
                              alt="Context"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                          <div className="w-10 h-1 bg-[var(--political-red)] rounded-full group-hover:w-20 transition-all duration-500" />
                          <span className="font-black text-gray-900 dark:text-white group-hover:text-[var(--political-red)] transition-colors">— {leader.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
