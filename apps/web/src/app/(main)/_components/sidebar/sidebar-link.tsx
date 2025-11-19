"use client";

import Link from "next/link";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

import { useSidebar } from "@o3osatoshi/ui/client";

interface SidebarLinkProps extends ComponentProps<typeof Link> {
  children: ReactNode;
}

export default function SidebarLink({ children, ...props }: SidebarLinkProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (isMobile) {
      setOpenMobile(false);
    }
    props.onClick?.(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
