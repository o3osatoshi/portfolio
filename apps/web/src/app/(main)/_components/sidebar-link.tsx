"use client";

import { useSidebar } from "@repo/ui/components/sidebar";
import Link from "next/link";
import type { ComponentProps } from "react";

interface SidebarLinkProps extends ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export function SidebarLink({ children, ...props }: SidebarLinkProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
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
