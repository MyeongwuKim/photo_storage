import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorite",
  description: "favorite list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
