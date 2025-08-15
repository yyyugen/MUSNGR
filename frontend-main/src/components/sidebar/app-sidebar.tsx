"use client";

import Link from "next/link";
import * as React from "react";
import {
  Command,
  Upload,
  LifeBuoy,
  Send,
  Settings2,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { NavSecondary } from "./nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/contact",
      icon: Send,
    },
  ],
  navMain: [
    {
      name: "Upload",
      url: "/dashboard",
      icon: ChartNoAxesColumnIncreasing,
    },
    {
      name: "Analytics",
      url: "/dashboard/analytics",
      icon: Upload,
    },
    {
      name: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // Create user object from session data or fallback
  const user = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email || "user@example.com",
    avatar: session.user.image || "/avatars/shadcn.jpg",
  } : {
    name: "Guest User",
    email: "guest@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Musngr</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary platform={data.navMain} />
        <NavMain items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
