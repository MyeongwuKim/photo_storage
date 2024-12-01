import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="Z-[99] fixed left-0 top-0 w-full h-full bg-white dark:bg-[rgb(18,18,18)]
    flex items-center justify-center"
    >
      {children}
    </div>
  );
}
