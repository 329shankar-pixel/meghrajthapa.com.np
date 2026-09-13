import { CalendarDays, CheckCircle2 } from 'lucide-react';

interface TimelineItem {
    id: number;
    title: string;
    date: string;
    photo: string | null;
}

interface InteractiveTimelineProps {
    items: TimelineItem[];
}

const dateValue = (date?: string | null) => {
    if (!date) return 0;
    const parsed = new Date(date).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDate = (date?: string | null) => {
    if (!date) return 'Present';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat('en', {
        month: 'long',
        year: 'numeric',
    }).format(parsed);
};

const formatYear = (date?: string | null) => {
    if (!date) return 'Now';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.getFullYear().toString();
};

export default function InteractiveTimeline({ items }: InteractiveTimelineProps) {
    const timeline = [...(items || [])].sort((a, b) => dateValue(a.date) - dateValue(b.date));

    if (timeline.length === 0) {
        return (
            <div className="border border-dashed border-congress-outline bg-congress-surface-muted px-6 py-16 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-congress-green-deep shadow-campaign dark:bg-slate-950 dark:text-white">
                    <CalendarDays className="h-8 w-8" />
                </div>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.22em] text-slate-500 dark:text-white/60">
                    Add timeline milestones from the admin panel.
                </p>
            </div>
        );
    }

    return (
        <div className="relative mx-auto max-w-5xl px-3 md:px-0">
            <div className="absolute bottom-0 left-5 top-0 w-px bg-congress-outline md:left-1/2 md:-translate-x-1/2" />

            <div className="grid gap-10 md:gap-14">
                {timeline.map((item, index) => {
                    const isEven = index % 2 === 0;

                    return (
                        <article
                            key={item.id}
                            className={`relative grid gap-5 pl-12 md:grid-cols-[1fr_88px_1fr] md:items-center md:gap-0 md:pl-0 ${
                                isEven ? '' : 'md:[&_.timeline-card]:col-start-3'
                            }`}
                        >
                            <div
                                className={`timeline-card group overflow-hidden border border-congress-outline bg-white shadow-[0_24px_80px_-58px_rgba(0,100,0,0.55)] transition duration-500 hover:-translate-y-1 hover:border-congress-red hover:shadow-patriotic dark:border-white/10 dark:bg-slate-950 ${
                                    isEven ? 'md:mr-10' : 'md:ml-10'
                                }`}
                            >
                                {item.photo && (
                                    <div className="relative aspect-[16/10] overflow-hidden bg-congress-surface-muted">
                                        <img
                                            src={`/storage/${item.photo}`}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                                        <p className="absolute bottom-4 left-4 right-4 text-xs font-black uppercase tracking-[0.18em] text-white/80">
                                            {formatDate(item.date)}
                                        </p>
                                    </div>
                                )}
                                <div className="p-6 md:p-7">
                                    {!item.photo && (
                                        <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-congress-red">
                                            <CalendarDays className="h-4 w-4" />
                                            {formatDate(item.date)}
                                        </p>
                                    )}
                                    <h3 className="font-display text-2xl font-bold leading-tight text-slate-950 dark:text-white">{item.title}</h3>
                                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-white/65">
                                        A documented milestone in the public journey, published dynamically from the leader timeline.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute left-0 top-7 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-congress-green-deep text-white shadow-campaign dark:border-slate-950 md:static md:mx-auto md:h-16 md:w-16">
                                <CheckCircle2 className="h-5 w-5 md:h-7 md:w-7" />
                            </div>

                            <div className={`hidden md:block ${isEven ? 'pl-10 text-left' : 'col-start-1 row-start-1 pr-10 text-right'}`}>
                                <p className="font-display text-4xl font-bold text-congress-green-deep dark:text-white">{formatYear(item.date)}</p>
                                <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-congress-red">Service Milestone</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
