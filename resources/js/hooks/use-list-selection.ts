import { useMemo, useState } from 'react';

export function useListSelection<T extends number | string>(ids: T[]) {
    const [selected, setSelected] = useState<T[]>([]);

    const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
    const selectedCount = selected.length;

    const toggleOne = (id: T, checked: boolean | 'indeterminate') => {
        const shouldSelect = checked === true;
        setSelected((current) => (shouldSelect ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)));
    };

    const toggleAll = () => {
        setSelected((current) => {
            if (allSelected) {
                return current.filter((id) => !ids.includes(id));
            }

            return Array.from(new Set([...current, ...ids]));
        });
    };

    return useMemo(
        () => ({
            selected,
            selectedCount,
            allSelected,
            toggleOne,
            toggleAll,
            clearSelection: () => setSelected([]),
        }),
        [selected, selectedCount, allSelected, ids],
    );
}
