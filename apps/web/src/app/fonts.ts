import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
});
