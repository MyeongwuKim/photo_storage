import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video",
  description: "video list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
