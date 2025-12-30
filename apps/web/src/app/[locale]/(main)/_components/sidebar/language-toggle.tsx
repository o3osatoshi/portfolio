"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { type Locale } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenuButton,
  useSidebar,
} from "@o3osatoshi/ui/client";

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const t = useTranslations("Settings");

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="sm">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span>{t("language")}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end">
        <DropdownMenuItem
          disabled={locale === "en"}
          onClick={() => handleSelect("en")}
        >
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={locale === "ja"}
          onClick={() => handleSelect("ja")}
        >
          {t("japanese")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
