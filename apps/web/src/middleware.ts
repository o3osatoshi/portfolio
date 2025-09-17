import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

const result = NextAuth(authConfig);

export const middleware: typeof result.auth = result.auth;
