import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo",
  description: "photo list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
