import { useState } from "react";
import {
  Zap,
  MapPin,
  AlertTriangle,
  Calendar,
  Eye,
  User,
  Settings,
  GalleryVerticalEnd,
  LogIn,
  UserPlus,
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
import { Link, useRouter } from "@tanstack/react-router";
import { ModeToggle } from "./ui/mode-toggle";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export const items = [
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
  },
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
  const auth = useAuth();
  if (!auth) throw new Error("useAuth must be used within AuthProvider");
  const { user, logout } = auth;
  const [authModalOpen, setAuthModalOpen] = useState<"login" | "signup" | null>(
    null
  );
  const router = useRouter();
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
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="my-8 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium  mb-3">Personalization</h3>
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
          {!user ? (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setAuthModalOpen("login")}
                  className="hover:bg-gray-800 flex items-center space-x-2 px-3 py-2 rounded-lg w-full"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setAuthModalOpen("signup")}
                  className="hover:bg-gray-800 flex items-center space-x-2 px-3 py-2 rounded-lg w-full"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={async () => {
                  await logout();
                  router.navigate({ to: "/" });
                }}
                className="hover:bg-gray-800 flex items-center space-x-2 px-3 py-2 rounded-lg w-full text-red-500"
              >
                <LogIn className="w-5 h-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <div className="mt-4">
          <ModeToggle />
        </div>
        {/* Auth Modal using shadcn/ui dialog */}
        <Dialog
          open={!!authModalOpen}
          onOpenChange={() => setAuthModalOpen(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {authModalOpen === "login" ? "Login" : "Sign Up"}
              </DialogTitle>
              <DialogClose asChild>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() => setAuthModalOpen(null)}
                >
                  Close
                </button>
              </DialogClose>
            </DialogHeader>
            {authModalOpen && (
              <AuthForm
                mode={authModalOpen}
                onClose={() => setAuthModalOpen(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
