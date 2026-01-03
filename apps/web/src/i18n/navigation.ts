import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

export const { getPathname, usePathname, Link, redirect, useRouter } =
  createNavigation(routing);
