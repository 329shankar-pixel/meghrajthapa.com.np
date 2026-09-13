import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { index, destroy } from '@/actions/App/Http/Controllers/ResourceController';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Calendar,
  User,
  Edit3,
  Trash2,
  Eye,
  Navigation,
  ExternalLink,
  Shield,
  Info,
  Bookmark,
  Star,
  BadgeCheck,
  Banknote,
  HeartHandshake,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResourcePhoto {
  id: number;
  photo_path: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  province_id: number;
  district_id: number;
  municipality_id: number;
  ward_number: number;
  tole: string | null;
  province_name: string;
  district_name: string;
  municipality_name: string;
  person_name: string;
  person_email: string;
  person_phone: string;
  project_category?: string | null;
  urgency?: string | null;
  estimated_budget?: string | null;
  beneficiaries?: string | null;
  is_bookmarked: boolean;
  is_important: boolean;
  photos: ResourcePhoto[];
  created_at: string;
}

interface Props {
  resource: Resource;
}

export default function Show({ resource }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resources', href: '/resources' },
    { title: resource.title, href: `/resources/${resource.id}` },
  ];

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${resource.title}?`)) {
      router.delete(destroy.url(resource.id));
    }
  };

  const toggleBookmark = () => {
    router.post(`/resources/${resource.id}/bookmark`, {}, { preserveScroll: true });
  };

  const toggleImportant = () => {
    router.post(`/resources/${resource.id}/important`, {}, { preserveScroll: true });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={resource.title} />

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
        {/* Navigation & Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <Link href={index().url}>
            <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>

          <div className="flex gap-3">
            <Button
              variant={resource.is_bookmarked ? 'default' : 'outline'}
              size="sm"
              className="rounded-full shadow-sm hover:shadow-md transition-all"
              onClick={toggleBookmark}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${resource.is_bookmarked ? 'fill-current' : ''}`} />
              {resource.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full shadow-sm hover:shadow-md transition-all ${resource.is_important ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200' : ''}`}
              onClick={toggleImportant}
            >
              <Star className={`mr-2 h-4 w-4 ${resource.is_important ? 'fill-current' : ''}`} />
              {resource.is_important ? 'Important' : 'Mark Important'}
            </Button>
            <Link href={`/resources/${resource.id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:shadow-md transition-all">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Resource
              </Button>
            </Link>
            <a href={`/resources/${resource.id}/download-pdf`}>
              <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:shadow-md transition-all">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full shadow-sm hover:shadow-md transition-all"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Move to Recycle
            </Button>
          </div>
        </motion.div>

        {/* Hero Section - Super Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-muted shadow-2xl group border border-white/20"
        >
          {resource.photos.length > 0 ? (
            <div className="aspect-[21/9] w-full relative overflow-hidden">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                src={`/storage/${resource.photos[0].photo_path}`}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="aspect-[21/9] w-full bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 scale-150" />
                <MapPin className="h-20 w-20 text-primary/40 relative" />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <span className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                  {resource.municipality_name}
                </span>
                <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-border/50 shadow-sm">
                  Ward {resource.ward_number}
                </span>
                {resource.is_bookmarked && (
                  <span className="flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    <Bookmark className="h-3 w-3 fill-current" />
                    Bookmarked
                  </span>
                )}
                {resource.is_important && (
                  <span className="flex items-center gap-1.5 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    Important
                  </span>
                )}
                <div className="h-5 w-[1px] bg-border/50 mx-1 hidden sm:block" />
                <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  <Calendar className="h-3 w-3" />
                  {new Date(resource.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-none"
              >
                {resource.title}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2"
            >
              <Button className="rounded-full px-8 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Navigation className="mr-2 h-5 w-5" />
                Get Directions
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants} className="rounded-[2rem] border bg-card p-8 sm:p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Info className="h-32 w-32 rotate-12" />
              </div>

              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="h-8 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                Resource Overview
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                  {resource.description}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(resource.project_category || resource.urgency) && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{resource.project_category || 'Community Project'}</h4>
                      <p className="text-xs text-muted-foreground">Urgency: {resource.urgency || 'Normal priority'}</p>
                    </div>
                  </div>
                )}
                {resource.estimated_budget && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Estimated Budget / Need</h4>
                      <p className="text-xs text-muted-foreground">{resource.estimated_budget}</p>
                    </div>
                  </div>
                )}
                {resource.beneficiaries && (
                  <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Beneficiaries</h4>
                      <p className="text-xs text-muted-foreground">{resource.beneficiaries}</p>
                    </div>
                  </div>
                )}
                <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Verified Resource</h4>
                    <p className="text-xs text-muted-foreground">This asset is registered and verified by the local administration.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                    <ExternalLink className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Public Access</h4>
                    <p className="text-xs text-muted-foreground">Open for community use and public welfare services.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visual Assets Grid */}
            {resource.photos.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <span className="h-8 w-1.5 bg-secondary rounded-full" />
                    Visual Assets
                  </h2>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{resource.photos.length} Captured Images</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resource.photos.map((photo, idx) => (
                    <motion.div
                      key={photo.id}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-transparent hover:border-primary/20 bg-muted shadow-sm transition-all duration-300"
                    >
                      <img
                        src={`/storage/${photo.photo_path}`}
                        alt=""
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <Button variant="outline" size="sm" className="w-full rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                      <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                        0{idx + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Premium Sidebar Component */}
          <div className="space-y-6 lg:-mt-20 relative z-10">
            {/* Glassmorphism Location Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border bg-background/60 backdrop-blur-2xl p-8 shadow-xl shadow-primary/5 border-white/20 dark:border-white/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">Geolocation</h3>
                  <p className="text-xs text-muted-foreground">Official administration data</p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: 'Province', value: resource.province_name, icon: "P" },
                  { label: 'District', value: resource.district_name, icon: "D" },
                  { label: 'Municipality', value: resource.municipality_name, icon: "M" },
                  { label: 'Ward No.', value: resource.ward_number, icon: "W" },
                  ...(resource.tole ? [{ label: 'Tole', value: resource.tole, icon: "T" }] : []),
                ].map((loc, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-black group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        {loc.icon}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{loc.label}</span>
                    </div>
                    <span className="font-black text-foreground">{loc.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Representative Card - Card Style */}
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border bg-gradient-to-br from-card to-muted p-8 shadow-lg relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary-foreground shadow-inner">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">Custodian</h3>
                  <p className="text-xs text-muted-foreground">Primary contact person</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-background shadow-sm border border-border/50 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-secondary mx-auto mb-3 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {resource.person_name.charAt(0)}
                  </div>
                  <h4 className="font-black text-xl leading-none">{resource.person_name}</h4>
                  <p className="text-xs text-muted-foreground mt-2 font-bold uppercase tracking-widest">Resource Manager</p>
                </div>

                <div className="space-y-3">
                  <a href={`tel:${resource.person_phone}`} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border hover:bg-primary/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold">Call Representative</span>
                    </div>
                    <span className="font-mono text-xs">{resource.person_phone}</span>
                  </a>

                  <a href={`mailto:${resource.person_email}`} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border hover:bg-primary/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs font-bold">Send Email</span>
                    </div>
                    <span className="text-xs truncate max-w-[120px] font-medium">{resource.person_email}</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Quick Metadata */}
            <motion.div
              variants={itemVariants}
              className="p-6 text-center"
            >
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-4">Registry Information</p>
              <div className="inline-flex items-center gap-4 bg-muted/50 rounded-full px-6 py-2 border border-border/50 text-[10px] font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-primary" />
                  ID #{resource.id.toString().padStart(4, '0')}
                </span>
                <div className="h-3 w-[1.5px] bg-border" />
                <span>REV V1.0.4</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .prose p { margin-bottom: 1.5rem; }
        .prose { --tw-prose-body: var(--foreground); }
      `}} />
    </AppLayout>
  );
}
