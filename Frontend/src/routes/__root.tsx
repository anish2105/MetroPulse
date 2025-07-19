/* eslint-disable react-hooks/rules-of-hooks */
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { items } from "@/components/app-sidebar";
import React from "react";
import Header from "@/components/header";
import LandingPage from "@/components/LandingPage";
import { AuthProvider } from "@/context/AuthContext";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [
    {
      title: "Home",
      url: "/",
    },
  ];
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

export const Route = createRootRoute({
  component: () => {
    const { location } = useRouterState();
    const pathname = location.pathname;

    if (pathname === "/") {
      return <LandingPage />;
    }

    const breadcrumbs = getBreadcrumbs(pathname);

    return (
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full h-full">
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
            <Outlet />
          </main>
        </SidebarProvider>
      </AuthProvider>
    );
  },
});
