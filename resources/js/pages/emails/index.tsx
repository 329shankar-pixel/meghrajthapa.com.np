import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { Mail, Search, Send, Users, CheckCircle2, Filter, MousePointer2, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

interface Recipient {
    id: string;
    type: string;
    source: string;
    name: string;
    email: string;
    meta?: string;
}

interface RecipientType {
    value: string;
    label: string;
}

interface SentEmail {
    id: number;
    subject: string;
    status: string;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    user?: {
        name: string;
    } | null;
}

interface PaginatedSentEmails {
    data: SentEmail[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    recipients: Recipient[];
    types: RecipientType[];
    filters: {
        type: string;
        search: string;
    };
    stats: {
        total: number;
        visible: number;
        types: Record<string, number>;
    };
    sentEmails: PaginatedSentEmails;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Email Center', href: '/email-center' },
];

const typeTone: Record<string, string> = {
    party_members: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-800',
    volunteers: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800',
    community_projects: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800',
    team_members: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-800',
    users: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700',
    leaders: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:ring-purple-800',
};

export default function EmailCenter({ recipients, types, filters, stats, sentEmails }: Props) {
    const [type, setType] = useState(filters.type || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        message: '',
        recipients: [] as string[],
    });

    const selectedCount = data.recipients.length;
    const allVisibleEmails = useMemo(() => recipients.map((recipient) => recipient.email), [recipients]);
    const allVisibleSelected = allVisibleEmails.length > 0 && allVisibleEmails.every((email) => data.recipients.includes(email));

    const applyFilters = () => {
        router.get('/email-center', { type, search }, { preserveState: true, preserveScroll: true });
    };

    const toggleRecipient = (email: string, checked: boolean | 'indeterminate') => {
        const shouldSelect = checked === true;
        setData(
            'recipients',
            shouldSelect
                ? Array.from(new Set([...data.recipients, email]))
                : data.recipients.filter((selectedEmail) => selectedEmail !== email),
        );
    };

    const toggleVisible = () => {
        if (allVisibleSelected) {
            setData('recipients', data.recipients.filter((email) => !allVisibleEmails.includes(email)));
            return;
        }

        setData('recipients', Array.from(new Set([...data.recipients, ...allVisibleEmails])));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/email-center/send', {
            preserveScroll: true,
            onSuccess: () => reset('subject', 'message', 'recipients'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Center" />

            <div className="space-y-8 p-4 md:p-6">
                <div className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-card via-background to-muted/40 shadow-sm">
                    <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                <Mail className="h-4 w-4" />
                                Campaign Email Center
                            </div>
                            <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">Send custom email to selected site contacts.</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                                Search all saved emails across party members, volunteers, community projects, supporters, users, and leader profiles. Filter by type, select recipients, and send one campaign message.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                            {[
                                { label: 'Total Emails', value: stats.total, icon: Users },
                                { label: 'Visible Now', value: stats.visible, icon: Filter },
                                { label: 'Selected', value: selectedCount, icon: CheckCircle2 },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl border bg-background/70 p-4 shadow-sm">
                                    <item.icon className="h-5 w-5 text-primary" />
                                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                                    <p className="text-3xl font-black">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[1.5rem] border bg-card shadow-sm">
                        <div className="border-b p-4 md:p-5">
                            <div className="grid gap-3 md:grid-cols-[220px_1fr_auto_auto]">
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Email type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, source, phone, project..." className="pl-9" />
                                </div>

                                <Button type="button" onClick={applyFilters}>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                                <Button type="button" variant="outline" onClick={toggleVisible} disabled={recipients.length === 0}>
                                    <MousePointer2 className="mr-2 h-4 w-4" />
                                    {allVisibleSelected ? 'Unselect Visible' : 'Select Visible'}
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[720px] overflow-auto">
                            {recipients.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground">No emails found for this filter.</div>
                            ) : (
                                <div className="divide-y">
                                    {recipients.map((recipient) => (
                                        <label key={recipient.id} className="flex cursor-pointer items-start gap-4 p-4 transition hover:bg-muted/40 md:p-5">
                                            <Checkbox
                                                checked={data.recipients.includes(recipient.email)}
                                                onCheckedChange={(checked) => toggleRecipient(recipient.email, checked)}
                                                className="mt-1"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-black md:text-base">{recipient.name}</p>
                                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${typeTone[recipient.type] || typeTone.users}`}>
                                                        {recipient.source}
                                                    </span>
                                                </div>
                                                <p className="mt-1 break-all text-sm font-semibold text-primary">{recipient.email}</p>
                                                {recipient.meta && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{recipient.meta}</p>}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={submit} className="sticky top-6 h-fit rounded-[1.5rem] border bg-card p-5 shadow-sm md:p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-black">Custom Message</h2>
                            <p className="mt-1 text-sm text-muted-foreground">The message will be queued for selected recipients.</p>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" value={data.subject} onChange={(event) => setData('subject', event.target.value)} placeholder="Campaign update, invitation, or follow-up" />
                                <InputError message={errors.subject} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(event) => setData('message', event.target.value)}
                                    placeholder="Write your custom campaign message..."
                                    className="min-h-64 resize-y"
                                />
                                <InputError message={errors.message} />
                            </div>

                            <div className="rounded-2xl bg-muted/60 p-4 text-sm">
                                <p className="font-black">{selectedCount} recipient(s) selected</p>
                                <p className="mt-1 text-xs text-muted-foreground">Use filters on the left to build a focused recipient list by contact type.</p>
                                <InputError message={errors.recipients} />
                            </div>

                            <Button type="submit" disabled={processing || selectedCount === 0} className="h-12 w-full rounded-full text-sm font-black">
                                <Send className="mr-2 h-4 w-4" />
                                {processing ? 'Queueing Message...' : 'Send to Selected Emails'}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="rounded-[1.5rem] border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-black">Sent Email History</h2>
                            <p className="text-sm text-muted-foreground">Open any sent message to view the full body and recipient delivery list.</p>
                        </div>
                        <Clock className="h-5 w-5 text-primary" />
                    </div>

                    {sentEmails.data.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground">No email campaigns have been sent yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40">
                                    <tr>
                                        <th className="p-4 text-left font-black">Subject</th>
                                        <th className="p-4 text-left font-black">Status</th>
                                        <th className="p-4 text-left font-black">Recipients</th>
                                        <th className="p-4 text-left font-black">Created</th>
                                        <th className="p-4 text-right font-black">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sentEmails.data.map((email) => (
                                        <tr key={email.id} className="transition hover:bg-muted/30">
                                            <td className="p-4">
                                                <p className="font-black">{email.subject}</p>
                                                <p className="text-xs text-muted-foreground">By {email.user?.name || 'System'}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
                                                    {email.status.replaceAll('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {email.sent_count}/{email.recipient_count} sent
                                                {email.failed_count > 0 && <span className="ml-2 text-destructive">{email.failed_count} failed</span>}
                                            </td>
                                            <td className="p-4 text-muted-foreground">{new Date(email.created_at).toLocaleString()}</td>
                                            <td className="p-4 text-right">
                                                <Link href={`/email-center/${email.id}`}>
                                                    <Button size="sm" variant="outline" className="rounded-full">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Full Email
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
