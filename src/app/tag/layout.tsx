import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tag",
  description: "tag list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
