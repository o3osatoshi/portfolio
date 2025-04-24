import { authConfig } from "@repo/auth/config";
import NextAuth from "next-auth";
import type { NextMiddleware } from "next/server";

const { auth } = NextAuth(authConfig);

export const middleware = auth as NextMiddleware;
