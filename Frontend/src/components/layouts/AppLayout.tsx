import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { items } from "@/components/app-sidebar";
import Header from "@/components/header";
import {  useRouterState } from "@tanstack/react-router";
import React from "react";

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

  return (
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
        {children}
      </main>
    </SidebarProvider>
  );
}
