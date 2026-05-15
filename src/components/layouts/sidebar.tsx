'use client';

import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Sliders,
  Trash2,
  Truck,
  UserCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { Can } from '@/components/ui/can/can';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { paths } from '@/config/paths';
import { signOut, useUser } from '@/lib/auth';
import { getRoleLabel, type Permission } from '@/lib/authorization';
import { cn } from '@/lib/utils';

type SubNavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission | null;
  children?: SubNavItem[];
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      {
        title: 'Tableau de bord',
        url: paths.dashboard.getHref(),
        icon: LayoutDashboard,
        permission: null,
      },
    ],
  },
  {
    label: 'Patients',
    items: [
      {
        title: 'Patients',
        url: paths.patients.list.getHref(),
        icon: Users,
        permission: 'patients:view',
        children: [
          {
            title: 'Liste des patients',
            url: paths.patients.list.getHref(),
            icon: Users,
            permission: 'patients:view',
          },
          {
            title: 'Examens',
            url: paths.exams.list.getHref(),
            icon: ClipboardList,
            permission: 'exams:view',
          },
          {
            title: 'Corbeille',
            url: paths.patients.trash.getHref(),
            icon: Trash2,
            permission: 'patients:view',
          },
        ],
      },
    ],
  },
  {
    label: 'Activité',
    items: [
      {
        title: 'Événements',
        url: paths.events.staff.list.getHref(),
        icon: CalendarRange,
        permission: 'appointments:view',
      },
      {
        title: 'Agenda',
        url: paths.rdv.staff.agenda.getHref(),
        icon: CalendarDays,
        permission: 'appointments:view',
        children: [
          {
            title: 'Rendez-vous',
            url: paths.rdv.staff.agenda.getHref(),
            icon: CalendarDays,
          },
          {
            title: 'Configuration',
            url: paths.rdv.staff.config.getHref(),
            icon: Settings,
          },
        ],
      },
    ],
  },
  {
    label: 'Analyse',
    items: [
      {
        title: 'Analytiques',
        url: paths.analytics.getHref(),
        icon: BarChart3,
        permission: 'analytics:view',
      },
    ],
  },
  {
    label: 'Conducteurs',
    items: [
      {
        title: 'Conducteurs',
        url: paths.drivers.list.getHref(),
        icon: Truck,
        permission: 'drivers:view',
        children: [
          {
            title: 'Liste des conducteurs',
            url: paths.drivers.list.getHref(),
            icon: Truck,
            permission: 'patients:view',
          },
          {
            title: 'Corbeille',
            url: paths.drivers.trash.getHref(),
            icon: Trash2,
            permission: 'patients:view',
          },
          {
            title: 'Examens',
            url: paths.drivers.exams.getHref(),
            icon: ClipboardList,
            permission: 'exams:view',
          },
          {
            title: 'Analytiques',
            url: paths.drivers.analytics.getHref(),
            icon: BarChart3,
            permission: 'analytics:view',
          },
        ],
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        title: 'Sites',
        url: paths.sites.list.getHref(),
        icon: MapPin,
        permission: 'sites:view',
      },
      {
        title: 'Facturation',
        url: paths.billing.list.getHref(),
        icon: Receipt,
        permission: 'billing:view',
      },
      {
        title: 'Prestations',
        url: paths.configuration.prestations.getHref(),
        icon: Package,
        permission: 'sites:view',
      },
      {
        title: 'Paramètres',
        url: paths.parametres.getHref(),
        icon: Sliders,
        permission: 'sites:view',
      },
    ],
  },
];

const adminItems: NavItem[] = [
  {
    title: 'Utilisateurs',
    url: paths.admin.users.getHref(),
    icon: ShieldCheck,
    permission: 'admin:users',
  },
];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  STAFF: 'bg-blue-500',
  DOCTEUR: 'bg-green-500',
  TECHNICIEN: 'bg-amber-500',
};

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function CollapsibleNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: (url: string) => boolean;
}) {
  const isParentActive = item.children?.some((c) => isActive(c.url)) ?? false;
  const [open, setOpen] = React.useState(isParentActive);

  React.useEffect(() => {
    if (isParentActive) setOpen(true);
  }, [isParentActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isParentActive}
            className="w-full"
          >
            <item.icon className="size-4" />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => {
              const subItem = (
                <SidebarMenuSubItem key={child.title}>
                  <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                    <Link href={child.url}>
                      <child.icon className="size-3.5" />
                      <span>{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );

              if (child.permission) {
                return (
                  <Can key={child.title} permission={child.permission}>
                    {subItem}
                  </Can>
                );
              }
              return subItem;
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const isActive = (url: string) => {
    if (url === '/') return pathname === '/';
    return pathname === url || pathname.startsWith(url + '/');
  };

  const initials = user ? getInitials(user.name ?? '', user.email ?? '') : 'U';
  const avatarBg = roleColors[user?.role ?? ''] ?? 'bg-muted';
  const roleLabel = user?.role
    ? getRoleLabel(user.role as Parameters<typeof getRoleLabel>[0])
    : '';

  return (
    <Sidebar collapsible="icon">
      {/* Header — Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Eye
                    className="size-4 text-primary-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GUISS</span>
                  <span className="text-xs text-muted-foreground">v1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main navigation */}
      <SidebarContent>
        {navGroups.map((group, i) => (
          <SidebarGroup key={i}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.children && item.children.length > 0) {
                    const node = (
                      <CollapsibleNavItem
                        key={item.title}
                        item={item}
                        isActive={isActive}
                      />
                    );
                    if (item.permission) {
                      return (
                        <Can key={item.title} permission={item.permission}>
                          {node}
                        </Can>
                      );
                    }
                    return node;
                  }

                  const menuItem = (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  if (item.permission) {
                    return (
                      <Can key={item.title} permission={item.permission}>
                        {menuItem}
                      </Can>
                    );
                  }
                  return menuItem;
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin section */}
        <Can permission="admin:users">
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Can>
      </SidebarContent>

      {/* Footer — User menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                      avatarBg,
                    )}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || user?.email || 'Utilisateur'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56 rounded-lg"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push('/profil')}>
                  <UserCircle className="mr-2 size-4" aria-hidden="true" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 size-4" aria-hidden="true" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="focus:bg-destructive/10 text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" aria-hidden="true" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
