import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  create,
  edit,
  destroy
} from '@/actions/App/Http/Controllers/ActivityController';
import { router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Photo {
  id: number;
  photo_path: string;
}

interface Activity {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  photos: Photo[];
  created_at: string;
}

interface PaginatedData {
  data: Activity[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Props {
  activities: PaginatedData;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Activities', href: '/activities' },
];

export default function Index({ activities }: Props) {
  const selection = useListSelection(activities.data.map((item) => item.id));

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Activities Management" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activities</h1>
            <p className="text-muted-foreground mt-1">
              Manage activities and media ({activities.total} total)
            </p>
          </div>
          <Link href={create().url}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Activity
            </Button>
          </Link>
        </div>

        {activities.data.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No activities entries yet</p>
            <Link href={create().url}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-3 pb-0">
                <ListSelectionToolbar
                  selectedCount={selection.selectedCount}
                  totalCount={activities.data.length}
                  allSelected={selection.allSelected}
                  onToggleAll={selection.toggleAll}
                  onClear={selection.clearSelection}
                  label="activities"
                />
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 font-medium">Activity</th>
                    <th className="text-left p-4 font-medium">Photos</th>
                    <th className="text-left p-4 font-medium">Created Date</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.data.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Checkbox checked={selection.selected.includes(item.id)} onCheckedChange={(checked) => selection.toggleOne(item.id, checked)} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.photos && item.photos.length > 0 ? (
                            <img
                              src={`/storage/${item.photos[0].photo_path}`}
                              alt=""
                              className="h-10 w-16 object-cover rounded border bg-muted"
                            />
                          ) : (
                            <div className="h-10 w-16 bg-muted rounded border flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-700/10 dark:text-blue-400">
                          {item.photos?.length || 0} Photos
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={edit.url(item.id)}>
                            <Button size="sm" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id, item.title)}
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

            {/* Pagination */}
            {activities.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {activities.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-2 rounded text-sm ${link.active
                      ? 'bg-primary text-primary-foreground'
                      : link.url
                        ? 'hover:bg-muted'
                        : 'opacity-50 cursor-not-allowed'
                      }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
