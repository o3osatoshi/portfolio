import authConfig from "@/lib/auth.config";
import NextAuth from "next-auth";

export const { handlers } = NextAuth({
  session: { strategy: "jwt" },
  ...authConfig,
});
