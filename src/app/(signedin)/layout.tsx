import SidebarLayout from "@/app/(signedin)/_components/sidebar/sidebar-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
