import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { index as eventsIndex, edit as eventEdit, exportVolunteersCsv, exportVolunteersPdf, sendVolunteerEmail } from '@/actions/App/Http/Controllers/EventController';
import { create as volunteerCreate, edit as volunteerEdit, destroy as volunteerDestroy } from '@/actions/App/Http/Controllers/VolunteerController';
import { ArrowLeft, Edit, Plus, Calendar, MapPin, Trash2, User, Phone, Mail, Download, FileText, FileSpreadsheet, Send } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Location {
  province: string;
  district: string;
  municipality: string;
}

interface Volunteer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  ward_number: number;
  location: Location;
}

interface Event {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  event_date: string;
  location: string | null;
}

interface Props {
  event: Event;
  volunteers: Volunteer[];
}

export default function Show({ event, volunteers }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Events', href: '/events' },
    { title: event.title, href: `/events/${event.id}` },
  ];

  const handleDeleteVolunteer = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from this event?`)) {
      router.delete(volunteerDestroy.url(id));
    }
  };

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const { data: emailData, setData: setEmailData, post: postEmail, processing: sendingEmail, reset: resetEmail, errors: emailErrors } = useForm({
    subject: '',
    content: '',
    attachment: null as File | null,
  });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    postEmail(sendVolunteerEmail.url(event.id), {
      onSuccess: () => {
        setIsEmailModalOpen(false);
        resetEmail();
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={event.title} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={eventsIndex().url} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.event_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link href={eventEdit.url(event.id)}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Event
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.content || '<p className="text-muted-foreground italic">No description provided.</p>' }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Volunteers</CardTitle>
                  <CardDescription>People assisting in this event ({volunteers.length})</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {volunteers.length > 0 && (
                    <>
                      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary/5">
                            <Send className="mr-2 h-4 w-4" />
                            Email Volunteers
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <form onSubmit={handleSendEmail}>
                            <DialogHeader>
                              <DialogTitle>Send Message to Volunteers</DialogTitle>
                              <DialogDescription>
                                This email will be sent to all <strong>{volunteers.length}</strong> volunteers of this event.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                  id="subject"
                                  value={emailData.subject}
                                  onChange={(e) => setEmailData('subject', e.target.value)}
                                  placeholder="Enter email subject"
                                  required
                                />
                                {emailErrors.subject && <p className="text-xs text-destructive">{emailErrors.subject}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="content">Message</Label>
                                <Textarea
                                  id="content"
                                  value={emailData.content}
                                  onChange={(e) => setEmailData('content', e.target.value)}
                                  placeholder="Write your message here..."
                                  rows={8}
                                  required
                                />
                                {emailErrors.content && <p className="text-xs text-destructive">{emailErrors.content}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="attachment">Attachment (Optional)</Label>
                                <Input
                                  id="attachment"
                                  type="file"
                                  onChange={(e) => setEmailData('attachment', e.target.files ? e.target.files[0] : null)}
                                  className="cursor-pointer"
                                />
                                <p className="text-[10px] text-muted-foreground">Max size: 10MB.</p>
                                {emailErrors.attachment && <p className="text-xs text-destructive">{emailErrors.attachment}</p>}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={sendingEmail}>
                                {sendingEmail ? 'Sending...' : 'Send Message'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <a href={exportVolunteersCsv.url(event.id)} download>
                        <Button size="sm" variant="outline">
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          CSV
                        </Button>
                      </a>
                      <a href={exportVolunteersPdf.url(event.id)} target="_blank">
                        <Button size="sm" variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </a>
                    </>
                  )}
                  <Link href={volunteerCreate.url({ query: { event_id: event.id } })}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Volunteer
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {volunteers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground italic">
                    No volunteers added yet.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Name</th>
                          <th className="text-left p-3 font-medium">Contact</th>
                          <th className="text-left p-3 font-medium">Location</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map((v) => (
                          <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {v.full_name}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  {v.phone}
                                </div>
                                <div className="flex items-center gap-1.5 whitespace-nowrap lowercase">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  {v.email}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-xs">
                                <div>{v.location?.province || 'N/A'}</div>
                                <div className="text-muted-foreground">{v.location?.district || 'N/A'}, {v.location?.municipality || 'N/A'} (Ward {v.ward_number})</div>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/volunteers/${v.id}/edit`}>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteVolunteer(v.id, v.full_name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
