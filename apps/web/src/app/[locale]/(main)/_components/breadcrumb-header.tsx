"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { findNavs } from "@/utils/nav-handler";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@o3osatoshi/ui";
import { Separator, SidebarTrigger } from "@o3osatoshi/ui/client";

export default function BreadcrumbHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const navs = findNavs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {navs?.map((nav, index) => {
              if (index === navs.length - 1) {
                return (
                  <BreadcrumbItem key={nav.alias}>
                    <BreadcrumbPage>{t(nav.alias)}</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }

              return (
                <React.Fragment key={nav.alias}>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link href={nav.pathName}>{t(nav.alias)}</Link>
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
