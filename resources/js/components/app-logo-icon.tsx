import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Campaign mark">
            <rect width="64" height="64" rx="14" fill="#FFFFFF" />
            <path d="M10 12h44v16H10z" fill="#C8102E" />
            <path d="M10 36h44v16H10z" fill="#008000" />
            <path d="M10 28h44v8H10z" fill="#FFFFFF" />
            <rect x="9" y="11" width="46" height="42" rx="8" fill="none" stroke="#006400" strokeWidth="4" />
            <circle cx="32" cy="32" r="9.5" fill="#FFFFFF" stroke="#006400" strokeWidth="3" />
            <path d="M25 38V24h6.9c4.1 0 7.1 2.6 7.1 6.5 0 4-3 6.6-7.1 6.6h-2.6V38H25Zm4.3-8.3H32c1.6 0 2.7-.8 2.7-2.3S33.6 25 32 25h-2.7v4.7Z" fill="#C8102E" />
            <path d="M17 56h30" stroke="#C8102E" strokeWidth="4" strokeLinecap="round" />
            <path d="M23 60h18" stroke="#008000" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}
