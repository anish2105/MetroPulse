import {
  Home,
  Zap,
  MapPin,
  AlertTriangle,
  Calendar,
  Eye,
  User,
  Settings,
  GalleryVerticalEnd,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./ui/mode-toggle";

export const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Live Feed",
    url: "/feed",
    icon: Zap,
  },
  {
    title: "City Map",
    url: "/map",
    icon: MapPin,
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
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  }
];

const personalizationItems = [
  {
    title: "MBTI Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Preferences",
    url: "/preferences",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row gap-2 px-4 pt-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg mb-2">
          <GalleryVerticalEnd className="size-5" />
        </div>
        <span className="font-bold text-2xl  tracking-wide">
          MetroPulse
        </span>
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
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="my-8 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium  mb-3">
                Personalization
              </h3>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {personalizationItems.map((item) => (
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
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/settings" 
                activeProps={{
                  className: "bg-blue-600 text-white",
                }}
                className=" hover:bg-gray-800 flex items-center space-x-2 px-3 py-2 rounded-lg w-full"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
