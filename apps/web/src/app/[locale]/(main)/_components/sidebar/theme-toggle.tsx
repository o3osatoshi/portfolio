"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenuButton,
  useSidebar,
} from "@o3osatoshi/ui/client";

export default function ThemeToggle() {
  const { setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const t = useTranslations("Settings");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="sm">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 dark:scale-100" />
          <span>{t("theme")}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
