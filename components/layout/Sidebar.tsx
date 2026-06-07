'use client';

import { NAV_STRUCTURE, type NavItem } from '@/components/layout/nav-config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { ChevronRight, Sun, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isPathActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navActiveClass =
  'bg-brand-muted text-brand shadow-[inset_3px_0_0_var(--brand)] hover:bg-brand-muted hover:text-brand data-active:bg-brand-muted data-active:text-brand';

function LiveBadge() {
  return (
    <SidebarMenuBadge className="bg-brand-muted text-[9px] font-semibold tracking-wide text-brand">
      <span className="mr-1 inline-block size-1 rounded-full bg-brand" />
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
        className={cn('h-8 rounded-lg transition-colors duration-200', active && navActiveClass)}
      >
        <Link href={href} className="cursor-pointer">
          <item.icon className={cn('size-4', active && 'text-brand')} />
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
            className={cn('h-8 rounded-lg transition-colors duration-200', childActive && navActiveClass)}
          >
            <item.icon className={cn('size-4', childActive && 'text-brand')} />
            <span>{item.label}</span>
            <ChevronRight className="ml-auto size-4 opacity-40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mx-0 border-l border-sidebar-border/60 px-2.5 py-0.5">
            {children.map((child) => {
              const active = isPathActive(pathname, child.href);
              return (
                <SidebarMenuSubItem key={child.href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    className={cn(
                      'h-7 rounded-md transition-colors duration-200',
                      active && 'bg-brand-muted font-medium text-brand',
                    )}
                  >
                    <Link href={child.href} className="cursor-pointer">
                      {child.label}
                    </Link>
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-12 rounded-xl bg-sidebar hover:bg-sidebar-accent data-[size=lg]:p-2.5"
            >
              <Link href="/" className="cursor-pointer">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand via-emerald-500 to-solar text-white shadow-md shadow-brand/20">
                  <Sun className="size-4.5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-bold tracking-tight">SuryaERP</span>
                  <span className="truncate text-[11px] font-medium text-muted-foreground">PM Surya Ghar</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-3 opacity-50" />

      <SidebarContent className="gap-0 px-1.5 pt-2">
        {NAV_STRUCTURE.map((group, index) => {
          const visibleItems = group.items.filter((item) => canShowItem(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.section ?? `group-${index}`} className="py-1">
              {group.section && (
                <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                  {group.section}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
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

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-brand-muted px-2.5 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand/10">
            <Zap className="size-3.5 text-brand" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[11px] font-semibold text-foreground">Solar ERP Platform</p>
            <p className="truncate text-[10px] text-muted-foreground">Real-time · Convex powered</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
