// src/components/layouts/AppLayout.tsx
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { items } from "@/components/sidebar/app-sidebar";
import Header from "@/components/header";
import { useRouterState } from "@tanstack/react-router";
import React, { useEffect, useState } from "react"; // Added useEffect and useState
import { useAuth } from "@/context/AuthContext"; // Added useAuth
import { Toaster } from "@/components/ui/sonner"; // Added Toaster for toasts
import { MbtiModalForm } from "../mbti/mbti-modal-form";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { title: string; url: string }[] = [];

  let url = "";
  segments.forEach((segment) => {
    url += "/" + segment;
    const match = items.find((item) => item.url === url);
    crumbs.push({
      title: match
        ? match.title
        : segment.charAt(0).toUpperCase() + segment.slice(1),
      url,
    });
  });

  return crumbs;
}

export default function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { location } = useRouterState();
  const pathname = location.pathname;
  const breadcrumbs = getBreadcrumbs(pathname);

  // MBTI Modal State and Logic
  const { user, loading } = useAuth();
  const [showMbtiModal, setShowMbtiModal] = useState(false);

  useEffect(() => {
    // Show if: not loading, user is logged in, and user.mbtiType is null/undefined
    if (!loading && user && !user.mbtiType) {
      const timer = setTimeout(() => {
        setShowMbtiModal(true);
      }, 10000);
      return () => clearTimeout(timer); // Cleanup timer on unmount
      // setShowMbtiModal(true);
    } else {
      setShowMbtiModal(false); // Hide if logged out or MBTI type is already set
    }
  }, [user, loading]); // Dependencies: re-run if user or loading state changes

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full">
        {/* This is your main tag */}
        <div className="px-4 flex border-b items-center gap-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.url}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={crumb.url}>
                      {crumb.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <Header />
        </div>
        {children}{" "}
        {/* This is where your route content (ProfilePage etc.) renders */}
        {/* MBTI Modal Form - Placed here to overlay the entire layout */}
        <MbtiModalForm
          isOpen={showMbtiModal}
          onClose={() => setShowMbtiModal(false)}
        />
        {/* Toaster for notifications */}
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
