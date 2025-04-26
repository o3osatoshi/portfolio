import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";

const result = NextAuth(authConfig);

export const middleware: typeof result.auth = result.auth;
