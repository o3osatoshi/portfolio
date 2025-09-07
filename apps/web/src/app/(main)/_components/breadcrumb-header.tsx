"use client";

import { findNavs } from "@/utils/handle-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarTrigger,
} from "@o3osatoshi/ui/src";
import { usePathname } from "next/navigation";
import React from "react";

export default function BreadcrumbHeader() {
  const pathname = usePathname();
  const navs = findNavs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {navs?.map((nav, index) => {
              if (index === navs.length - 1) {
                return (
                  <BreadcrumbItem key={nav.alias}>
                    <BreadcrumbPage>{nav.data.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }

              return (
                <React.Fragment key={nav.alias}>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={nav.pathName}>
                      {nav.data.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
