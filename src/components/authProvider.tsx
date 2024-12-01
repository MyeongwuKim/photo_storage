"use client";
import { SessionProvider } from "next-auth/react";
import Providers from "./theme-provider";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <Providers>{children}</Providers>
    </SessionProvider>
  );
}
