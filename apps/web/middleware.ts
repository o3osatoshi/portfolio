import { authConfig } from "@repo/auth/config";
import NextAuth from "next-auth";

const nextAuth = NextAuth(authConfig);

export const middleware: typeof nextAuth.auth = nextAuth.auth;
