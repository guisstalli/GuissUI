'use client';

import {
  AlertCircle,
  Baby,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { paths } from '@/config/paths';
import { Permission } from '@/lib/authorization';
import { cn } from '@/lib/utils';

import { useSidebar } from './sidebar-context';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    items: [
      {
        name: 'Tableau de bord',
        href: paths.dashboard.getHref(),
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Patients',
    items: [
      {
        name: 'Patients',
        href: paths.patients.list.getHref(),
        icon: Users,
        permission: 'patients:view',
      },
      /*
      {
        name: 'Dossiers Patients',
        href: '/patients/records',
        icon: FolderOpen,
        permission: 'patient-records:view',
      },
      */
    ],
  },
  {
    title: 'Examens',
    items: [
      {
        name: 'Examens Adulte',
        href: paths.exams.adult.list.getHref(),
        icon: ClipboardList,
        permission: 'exams:view',
      },
      {
        name: 'Examens Enfant',
        href: paths.exams.child.list.getHref(),
        icon: Baby,
        permission: 'exams:view',
      },
      {
        name: 'Examens Incomplets',
        href: paths.exams.incomplete.getHref(),
        icon: AlertCircle,
        permission: 'exams:view',
      },
    ],
  },
];

function NavLink({
  item,
  isActive,
  isCollapsed,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
        isCollapsed && 'justify-center px-2',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="size-4 shrink-0" aria-hidden="true" />
      {!isCollapsed && <span>{item.name}</span>}
    </Link>
  );

  const content = isCollapsed ? (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
      <TooltipContent side="right" className="font-medium">
        {item.name}
      </TooltipContent>
    </Tooltip>
  ) : (
    linkContent
  );

  if (item.permission) {
    return <Can permission={item.permission}>{content}</Can>;
  }

  return content;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo + Toggle Button (moved to top) */}
        <div
          className={cn(
            'flex h-14 items-center border-b border-sidebar-border',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Eye
                className="size-4 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            {!isCollapsed && (
              <span className="text-base font-semibold text-sidebar-foreground">
                GUISS
              </span>
            )}
          </div>
          {/* Toggle Button - Now in header */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              isCollapsed && 'absolute right-2 top-3',
            )}
            aria-label={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav
          className={cn(
            'flex-1 space-y-6 overflow-y-auto py-4',
            isCollapsed ? 'px-2' : 'px-3',
          )}
          aria-label="Navigation principale"
        >
          {navigation.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && !isCollapsed && (
                <h3 className="text-sidebar-foreground/50 mb-2 px-3 text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {section.title && isCollapsed && (
                <div className="my-2 border-t border-sidebar-border" />
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      item={item}
                      isActive={isActive(item.href)}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer - only when expanded */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <p className="text-sidebar-foreground/50 text-xs">
              GUISS v1.0 — Plateforme médicale
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
