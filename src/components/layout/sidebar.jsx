"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Inbox, Calendar, Settings, LogOut, Building2 } from "lucide-react";
import { logout } from "@/actions/auth";

function isAdminHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  return (host.split(".")[0] || "").toLowerCase() === "admin";
}

export function AppSidebar() {
  const [isPending, startTransition] = useTransition();
  const adminHost = isAdminHost();

  // On admin subdomain, middleware rewrites /home -> /admin/home, /unidades -> /admin/unidades.
  // On normal domain/path access, keep /admin/* routes.
  const homeUrl = adminHost ? "/home" : "/admin/home";
  const unitsUrl = adminHost ? "/units" : "/admin/units";

  // Menu items
  const items = [
    {
      title: "Home",
      url: homeUrl,
      icon: Home,
    },
    {
      title: "Units",
      url: unitsUrl,
      icon: Building2,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-semibold">T</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Travel</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">App</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={handleLogout}
              disabled={isPending}
            >
              <LogOut />
              <span>{isPending ? "Saindo..." : "Sair"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
