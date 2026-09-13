import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  create,
  edit,
  destroy
} from '@/actions/App/Http/Controllers/PartyMemberTypeController';
import { router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import ListSelectionToolbar from '@/components/list-selection-toolbar';
import { useListSelection } from '@/hooks/use-list-selection';

interface PartyMemberType {
  id: number;
  name: string;
  description: string | null;
  party_members_count: number;
}

interface Props {
  partyMemberTypes: PartyMemberType[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Member Types', href: '/party-member-types' },
];

export default function Index({ partyMemberTypes }: Props) {
  const selection = useListSelection(partyMemberTypes.map((type) => type.id));

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This can only be done if no members are assigned to this type.`)) {
      router.delete(destroy.url(id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Member Types" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Member Types</h1>
            <p className="text-muted-foreground mt-1">
              Manage organizations/groups (NSU, Tarun Dal, etc.)
            </p>
          </div>
          <Link href={create().url}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Type
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-3 pb-0">
            <ListSelectionToolbar selectedCount={selection.selectedCount} totalCount={partyMemberTypes.length} allSelected={selection.allSelected} onToggleAll={selection.toggleAll} onClear={selection.clearSelection} label="member types" />
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 p-4"></th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Description</th>
                <th className="text-left p-4 font-medium">Members</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partyMemberTypes.map((type) => (
                <tr key={type.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Checkbox checked={selection.selected.includes(type.id)} onCheckedChange={(checked) => selection.toggleOne(type.id, checked)} />
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                      {type.name}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {type.description || '-'}
                  </td>
                  <td className="p-4">
                    {type.party_members_count}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={edit.url(type.id)}>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(type.id, type.name)}
                        disabled={type.party_members_count > 0}
                        title={type.party_members_count > 0 ? "Cannot delete type with active members" : ""}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {partyMemberTypes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No member types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
