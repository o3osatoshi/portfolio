"use client";

import { findNavs } from "@/utils/handle-nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { Separator } from "@repo/ui/components/separator";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { usePathname } from "next/navigation";

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
                  <BreadcrumbItem>
                    <BreadcrumbPage>{nav.data.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }

              return (
                <>
                  <BreadcrumbItem
                    key={`${nav.alias}-item`}
                    className="hidden md:block"
                  >
                    <BreadcrumbLink href={nav.pathName}>
                      {nav.data.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator
                    key={`${nav.alias}-separator`}
                    className="hidden md:block"
                  />
                </>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
