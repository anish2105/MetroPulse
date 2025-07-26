import {
  Zap,
  // MapPin,
  AlertTriangle,
  Calendar,
  Eye,
  User, // This is the Lucide-React User icon
  GalleryVerticalEnd,
  BotIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

import { NavUser } from "./nav-user";

// Removed these imports as they are no longer needed in AppSidebar:
// import { useEffect, useState } from "react";
// import type { AppUser } from "@/types/User";
// import { onAuthStateChanged } from "firebase/auth";

export const items = [
  {
    title: "Live Feed",
    url: "/feed",
    icon: Zap,
  },
  // {
  //   title: "City Map",
  //   url: "/map",
  //   icon: MapPin,
  // },
  {
    title: "Chat",
    url: "/chat",
    icon: BotIcon,
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: Eye,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User, // This correctly refers to the Lucide-React icon
  },
];

export function AppSidebar() {
  // Destructure 'user' and 'loading' directly from your AuthContext
  // The 'user' here will be of type AppUser | null, and 'loading' will reflect
  // the initial state of authentication provided by the context.
  const { user, loading } = useAuth();

  // If you want to show a loading state for the sidebar based on auth
  if (loading) {
    return <div>Loading navigation...</div>;
  }

  // Rest of your component now directly uses the 'user' from the context
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row gap-2 px-4 pt-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg mb-2">
          <GalleryVerticalEnd className="size-5" />
        </div>
        <span className="font-bold text-2xl  tracking-wide">MetroPulse</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="">
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      activeProps={{
                        className: "bg-blue-600 text-white",
                      }}
                      className=" hover:bg-gray-800 flex items-center space-x-2 px-3 py-2 rounded-lg w-full"
                    >
                      <item.icon className="w-5 h-5" />
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
        <NavUser user={user!} />
      </SidebarFooter>
    </Sidebar>
  );
}
