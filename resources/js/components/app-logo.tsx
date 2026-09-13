import { usePage } from '@inertiajs/react';
import SiteLogoMark from './site-logo-mark';

export default function AppLogo() {
    const { props } = usePage<any>();
    const settings = props.settings || {};
    const partyName = settings.party_name || props.name || 'राजनीतिक दल';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                <SiteLogoMark className="size-full" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {partyName}
                </span>
            </div>
        </>
    );
}
