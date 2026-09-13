import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

interface Props {
    className?: string;
}

export default function SiteLogoMark({ className = 'size-5' }: Props) {
    const { props } = usePage<any>();
    const settings = props.settings || {};
    const partyName = settings.party_name || props.name || 'Campaign';
    const logo = settings.site_logo || settings.party_flag || settings.favicon;

    if (logo) {
        return <img src={`/storage/${logo}`} alt={`${partyName} logo`} className={`${className} rounded-sm object-cover`} />;
    }

    return <AppLogoIcon className={`${className} shrink-0`} />;
}
