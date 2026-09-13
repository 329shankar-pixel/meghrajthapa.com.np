import { Link } from '@inertiajs/react';

interface CampaignLogoProps {
    partyName: string;
    brandName?: string | null;
    leaderName?: string | null;
    leaderImage?: string | null;
    logo?: string | null;
    campaignLabel?: string | null;
    compact?: boolean;
    showImage?: boolean;
    inverse?: boolean;
}

export default function CampaignLogo({
    partyName,
    brandName,
    leaderName,
    leaderImage,
    logo,
    campaignLabel,
    compact = false,
    showImage = true,
    inverse = false,
}: CampaignLogoProps) {
    const image = logo ? `/storage/${logo}` : leaderImage ? `/storage/${leaderImage}` : '/logo.svg';
    const label = campaignLabel || `${partyName} Campaign`;
    const displayName = brandName || partyName;

    return (
        <Link href="/" className="group flex min-w-0 items-center gap-3">
            {showImage && (
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-congress-green-deep/10 md:h-16 md:w-16">
                    <img
                        src={image}
                        alt={`${displayName} campaign logo`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-1.5 bg-congress-stripe" />
                </div>
            )}
            <div className="min-w-0">
                <p className={`truncate font-display text-xl font-black leading-tight md:text-2xl ${inverse ? 'text-white' : 'text-congress-green-deep'}`}>
                    {displayName}
                </p>
                {!compact && (
                    <p className={`mt-0.5 truncate font-nepali text-[11px] font-bold uppercase tracking-[0.18em] md:text-xs ${inverse ? 'text-white/85' : 'text-congress-red'}`}>
                        {label}
                    </p>
                )}
            </div>
        </Link>
    );
}
