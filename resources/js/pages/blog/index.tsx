import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  create,
  edit,
  destroy
} from '@/actions/App/Http/Controllers/BlogController';
import { router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Globe, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface Post {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  featured_image: string | null;
  created_at: string;
  user?: {
    name: string;
  };
}

interface PaginatedData {
  data: Post[];
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
  posts: PaginatedData;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Blog', href: '/blog' },
];

export default function Index({ posts }: Props) {
  const selection = useListSelection(posts.data.map((item) => item.id));

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Blog Management" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your blog articles ({posts.total} total)
            </p>
          </div>
          <Link href={create().url}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </Link>
        </div>

        {posts.data.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <Link href={create().url}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Post
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-3 pb-0">
                <ListSelectionToolbar
                  selectedCount={selection.selectedCount}
                  totalCount={posts.data.length}
                  allSelected={selection.allSelected}
                  onToggleAll={selection.toggleAll}
                  onClear={selection.clearSelection}
                  label="posts"
                />
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Author</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Published Date</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.data.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Checkbox checked={selection.selected.includes(item.id)} onCheckedChange={(checked) => selection.toggleOne(item.id, checked)} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.featured_image ? (
                            <img
                              src={`/storage/${item.featured_image}`}
                              alt=""
                              className="h-10 w-16 object-cover rounded border bg-muted"
                            />
                          ) : (
                            <div className="h-10 w-16 bg-muted rounded border flex items-center justify-center">
                              <span className="text-[10px] text-muted-foreground font-medium uppercase">No Img</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {item.user?.name || 'Unknown'}
                      </td>
                      <td className="p-4">
                        {item.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-700/10 dark:text-green-400">
                            <Globe className="h-3 w-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-700/10 dark:text-yellow-400">
                            <Lock className="h-3 w-3" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'N/A'}
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
            {posts.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {posts.links.map((link, index) => (
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
