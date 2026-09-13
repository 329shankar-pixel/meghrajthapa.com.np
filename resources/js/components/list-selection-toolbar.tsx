import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CheckSquare, X } from 'lucide-react';

interface Props {
    selectedCount: number;
    totalCount: number;
    allSelected: boolean;
    onToggleAll: () => void;
    onClear: () => void;
    label?: string;
}

export default function ListSelectionToolbar({ selectedCount, totalCount, allSelected, onToggleAll, onClear, label = 'items' }: Props) {
    return (
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border bg-card/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
                <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
                <span>Select all visible {label}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-black text-muted-foreground">{totalCount}</span>
            </label>
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary">
                    <CheckSquare className="h-3.5 w-3.5" />
                    {selectedCount} selected
                </span>
                {selectedCount > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={onClear} className="rounded-full">
                        <X className="mr-1 h-3.5 w-3.5" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
