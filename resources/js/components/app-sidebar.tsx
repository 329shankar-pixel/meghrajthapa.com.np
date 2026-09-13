import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import leader from '@/routes/leader';
import { index as partyMembersIndex } from '@/actions/App/Http/Controllers/PartyMemberController';
import { index as partyMemberTypesIndex } from '@/actions/App/Http/Controllers/PartyMemberTypeController';
import { index as newsIndex } from '@/actions/App/Http/Controllers/NewsController';
import { index as activitiesIndex } from '@/actions/App/Http/Controllers/ActivityController';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { index as resourcesIndex } from '@/actions/App/Http/Controllers/ResourceController';
import { index as blogIndex } from '@/actions/App/Http/Controllers/BlogController';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Tags, Newspaper, Camera, Calendar, UserCheck, Video, Image, Database, BookOpen, Shield, Mail, Bookmark, Archive } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermission } from '@/hooks/usePermission';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Party Members',
        href: partyMembersIndex.url(),
        icon: Users,
    },
    {
        title: 'Member Recycle',
        href: '/party-members/recycle',
        icon: Archive,
    },
    {
        title: 'Member Types',
        href: partyMemberTypesIndex.url(),
        icon: Tags,
    },
    {
        title: 'News',
        href: newsIndex.url(),
        icon: Newspaper,
    },
    {
        title: 'Blog',
        href: blogIndex.url(),
        icon: BookOpen,
    },
    {
        title: 'Activities',
        href: activitiesIndex.url(),
        icon: Camera,
    },
    {
        title: 'Events',
        href: eventsIndex.url(),
        icon: Calendar,
    },
    {
        title: 'Resources',
        href: resourcesIndex.url(),
        icon: Database,
    },
    {
        title: 'Bookmarked Projects',
        href: '/resources/bookmarks',
        icon: Bookmark,
    },
    {
        title: 'Email Center',
        href: '/email-center',
        icon: Mail,
    },
    {
        title: 'Leader',
        icon: UserCheck,
        url: '#',
        items: [
            {
                title: 'Profile',
                url: '/leader/profile',
            },
            {
                title: 'Biography',
                url: '/leader/biography',
            },
            {
                title: 'Quotes',
                url: '/leader/quotes',
            },
            {
                title: 'Timeline',
                url: '/leader/timelines',
            },
        ]
    },
    {
        title: 'Infographics',
        href: '/leader/infographics',
        icon: Camera,
    },
    {
        title: 'Videos',
        href: '/leader/videos',
        icon: Video,
    },
    {
        title: 'Galleries',
        href: '/leader/galleries',
        icon: Image,
    },
    {
        title: 'Access Control',
        icon: Shield,
        url: '#',
        items: [
            {
                title: 'Users',
                url: '/users',
            },
            {
                title: 'Roles',
                url: '/roles',
            },
            {
                title: 'Permissions',
                url: '/permissions',
            },
        ]
    },
    {
        title: 'Site Settings',
        icon: LayoutGrid,
        url: '#',
        items: [
            {
                title: 'Homepage & Branding',
                url: '/site-settings',
            },
            {
                title: 'Vision Pillars',
                url: '/missions',
            },
            {
                title: 'Public Statistics',
                url: '/stats',
            },
        ]
    },
];

const footerNavItems: NavItem[] = [];


export function AppSidebar() {
    // Filter Navigation Items based on permissions
    const filteredNavItems = mainNavItems.filter(item => {
        if (item.title === 'Dashboard') return true;

        // Define permission mapping for modules
        const moduleMap: Record<string, string> = {
            'Party Members': 'members',
            'Member Recycle': 'members',
            'Member Types': 'member-types',
            'News': 'news',
            'Blog': 'blog',
            'Activities': 'activities',
            'Events': 'events',
            'Resources': 'resources',
            'Bookmarked Projects': 'resources',
            'Email Center': 'emails',
            'Leader': 'leader',
            'Access Control': 'access-control',
            'Site Settings': 'settings',
        };

        const module = moduleMap[item.title as string];
        if (module) {
            const hasAny = usePermission([`view-${module}`, `create-${module}`, `update-${module}`, `delete-${module}`]);
            if (hasAny) {
                // Determine the best entry point
                const canView = usePermission(`view-${module}`);
                const canCreate = usePermission(`create-${module}`);

                if (!canView && canCreate) {
                    if (item.title === 'Party Members') item.href = '/party-members/create';
                    if (item.title === 'Member Types') item.href = '/party-member-types/create';
                    if (item.title === 'News') item.href = '/news/create';
                    if (item.title === 'Blog') item.href = '/blog/create';
                    if (item.title === 'Activities') item.href = '/activities/create';
                    if (item.title === 'Events') item.href = '/events/create';
                    if (item.title === 'Resources') item.href = '/resources/create';
                    if (item.title === 'Bookmarked Projects') item.href = '/resources/create';
                }
                return true;
            }
            return false;
        }

        if (item.title === 'Infographics' || item.title === 'Videos' || item.title === 'Galleries') {
            return usePermission(['view-leader', 'create-leader', 'update-leader', 'delete-leader']);
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
