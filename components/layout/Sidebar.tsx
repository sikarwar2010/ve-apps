'use client';

import { NAV_STRUCTURE, type NavItem } from '@/components/layout/nav-config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { ChevronRight, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isPathActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LiveBadge() {
  return (
    <SidebarMenuBadge className="bg-emerald-500/12 text-[9px] font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
      <span className="mr-1 inline-block size-1 animate-pulse rounded-full bg-emerald-500" />
      LIVE
    </SidebarMenuBadge>
  );
}

function NavLinkItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const href = item.href ?? '/';
  const active = isPathActive(pathname, href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.label}
        className={cn(
          active &&
            'bg-amber-500/12 text-amber-700 shadow-[inset_3px_0_0_#f59e0b] hover:bg-amber-500/15 hover:text-amber-700 data-active:bg-amber-500/12 data-active:text-amber-700 dark:text-amber-400 dark:hover:text-amber-400 dark:data-active:text-amber-400',
        )}
      >
        <Link href={href}>
          <item.icon className={cn(active && 'text-amber-600 dark:text-amber-400')} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {item.badge === 'live' && <LiveBadge />}
    </SidebarMenuItem>
  );
}

function NavGroupItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const children = item.children ?? [];
  const childActive = children.some((c) => isPathActive(pathname, c.href));
  const defaultOpen =
    childActive || ['Procurement', 'Inventory', 'Accounts', 'Service', 'Finance'].includes(item.label);

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.label}
            isActive={childActive}
            className={cn(
              childActive &&
                'bg-amber-500/12 text-amber-700 shadow-[inset_3px_0_0_#f59e0b] dark:text-amber-400 dark:data-active:text-amber-400',
            )}
          >
            <item.icon className={cn(childActive && 'text-amber-600 dark:text-amber-400')} />
            <span>{item.label}</span>
            <ChevronRight className="ml-auto size-4 opacity-50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child) => {
              const active = isPathActive(pathname, child.href);
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    className={cn(active && 'font-semibold text-amber-600 dark:text-amber-400')}
                  >
                    <Link href={child.href}>{child.label}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { hasPermission, isLoading, hasDbUser } = usePermissions();

  const canShowItem = (permission: NavItem['permission']) => {
    if (permission == null) return true;
    if (isLoading || !hasDbUser) return true;
    return hasPermission(permission);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-12 rounded-xl bg-sidebar hover:bg-sidebar-accent data-[size=lg]:p-2.5"
            >
              <Link href="/">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25">
                  <Sun className="size-4.5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-bold tracking-tight">SuryaERP</span>
                  <span className="truncate text-[11px] font-medium text-muted-foreground">PM Surya Ghar</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 opacity-60" />

      <SidebarContent className="px-1.5 pt-1">
        {NAV_STRUCTURE.map((group, index) => {
          const visibleItems = group.items.filter((item) => canShowItem(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.section ?? `group-${index}`}>
              {group.section && (
                <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/50 uppercase">
                  {group.section}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) =>
                    item.children ? (
                      <NavGroupItem key={item.label} item={item} pathname={pathname} />
                    ) : (
                      <NavLinkItem key={item.label} item={item} pathname={pathname} />
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
