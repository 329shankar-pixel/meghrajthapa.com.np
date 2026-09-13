import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Mail, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Recipient {
    id: number;
    email: string;
    status: string;
    error?: string | null;
    sent_at?: string | null;
}

interface SentEmail {
    id: number;
    subject: string;
    message: string;
    status: string;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    sent_at?: string | null;
    user?: {
        name: string;
    } | null;
    recipients: Recipient[];
}

interface Props {
    sentEmail: SentEmail;
}

export default function SentEmailShow({ sentEmail }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Email Center', href: '/email-center' },
        { title: sentEmail.subject, href: `/email-center/${sentEmail.id}` },
    ];

    const statusIcon = (status: string) => {
        if (status === 'sent') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
        return <Clock className="h-4 w-4 text-amber-600" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Sent Email: ${sentEmail.subject}`} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-[1.75rem] border bg-card p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link href="/email-center">
                            <Button variant="ghost" size="sm" className="mb-4 rounded-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Email Center
                            </Button>
                        </Link>
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                            <Mail className="h-4 w-4" />
                            Full Sent Email
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{sentEmail.subject}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Created {new Date(sentEmail.created_at).toLocaleString()} by {sentEmail.user?.name || 'System'}
                        </p>
                    </div>

                    <div className="grid min-w-72 grid-cols-3 gap-3">
                        {[
                            { label: 'Recipients', value: sentEmail.recipient_count },
                            { label: 'Sent', value: sentEmail.sent_count },
                            { label: 'Failed', value: sentEmail.failed_count },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border bg-background/70 p-4 text-center">
                                <p className="text-2xl font-black">{item.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[1.5rem] border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-black">Message Body</h2>
                        <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-muted/50 p-5 text-sm leading-7">
                            {sentEmail.message}
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border bg-card shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="text-xl font-black">Recipient Delivery</h2>
                            <p className="text-sm text-muted-foreground">Full delivery list for this email.</p>
                        </div>
                        <div className="max-h-[640px] overflow-auto">
                            <div className="divide-y">
                                {sentEmail.recipients.map((recipient) => (
                                    <div key={recipient.id} className="flex items-start gap-3 p-4">
                                        {statusIcon(recipient.status)}
                                        <div className="min-w-0 flex-1">
                                            <p className="break-all text-sm font-black">{recipient.email}</p>
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {recipient.status}
                                                {recipient.sent_at ? ` at ${new Date(recipient.sent_at).toLocaleString()}` : ''}
                                            </p>
                                            {recipient.error && <p className="mt-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{recipient.error}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
