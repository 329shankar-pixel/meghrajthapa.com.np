import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as storeQuote, destroy as destroyQuote } from '@/actions/App/Http/Controllers/QuoteController';
import { FormEventHandler, useState } from 'react';
import { Trash2, Plus, Quote as QuoteIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Quote {
  id: number;
  quote: string;
  image: string | null;
}

interface Leader {
  id: number;
  name: string;
}

interface Props {
  leader: Leader;
  quotes: Quote[];
}

export default function Quotes({ leader, quotes }: Props) {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leader', href: '#' },
    { title: 'Quotes', href: '#' },
  ];

  const quoteForm = useForm({
    leader_id: leader.id,
    quote: '',
    image: null as File | null,
  });

  const submitQuote: FormEventHandler = (e) => {
    e.preventDefault();
    quoteForm.post(storeQuote.url(), {
      forceFormData: true,
      onSuccess: () => {
        quoteForm.reset('quote', 'image');
        setIsQuoteDialogOpen(false);
      },
    });
  };

  const handleDeleteQuote = (id: number) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      router.delete(destroyQuote.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Leader Quotes" />

      <div className="mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leader Quotes</h1>
            <p className="text-muted-foreground mt-1">
              Manage quotes for <strong>{leader.name}</strong>
            </p>
          </div>
          <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Quote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Quote</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitQuote} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="quote">Quote Text</Label>
                  <Textarea
                    id="quote"
                    value={quoteForm.data.quote}
                    onChange={(e) => quoteForm.setData('quote', e.target.value)}
                    placeholder="Enter the quote..."
                    rows={4}
                  />
                  <InputError message={quoteForm.errors.quote} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quote-image">Feature Image (Optional)</Label>
                  <Input
                    id="quote-image"
                    type="file"
                    onChange={(e) => quoteForm.setData('image', e.target.files ? e.target.files[0] : null)}
                    accept="image/*"
                  />
                  <InputError message={quoteForm.errors.image} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={quoteForm.processing}>
                    Add Quote
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.length === 0 ? (
            <div className="col-span-full rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground mb-4">No quotes added yet.</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <p className="text-lg italic mb-4 leading-relaxed">"{quote.quote}"</p>
                {quote.image && (
                  <div className="aspect-video w-full overflow-hidden rounded-md mb-4 border">
                    <img
                      src={`/storage/${quote.image}`}
                      alt="Quote image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteQuote(quote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
