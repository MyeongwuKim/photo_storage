import type { Metadata } from "next";
import "./globals.css";
import "./heart.css";
import TopView from "@/components/layout/topView";
import TabView from "@/components/layout/tabView";
import {
  PhotoIcon,
  VideoCameraIcon,
  TagIcon,
  Squares2X2Icon,
  StarIcon,
} from "@heroicons/react/20/solid";
import AuthProvider from "@/components/authProvider";
import { QueryProvider } from "@/components/queryProvider";
import Script from "next/script";

import ErrorBoundryWrapper from "@/components/errorBoundryWrapper";
import { UIProvider } from "@/components/uiProvider";
import ReduxProvider from "@/components/reduxProvider";
import { pretendard, jetbrainsMono } from "./fonts";

export const metadata: Metadata = {
  title: "Home",
  description: "list photo & video",
};

const tabViewItemData = [
  {
    content: "",
    route: "/",
    icon: <span className="font-bold">Feed</span>,
  },
  {
    content: "",
    route: "/photo",
    icon: <span className="font-bold">Photo</span>,
  },
  {
    content: "",
    route: "/video",
    icon: <span className="font-bold">Video</span>,
  },
  { content: "", route: "/tag", icon: <span className="font-bold">Tag</span> },
  {
    content: "",
    route: "/favorite",
    icon: <span className="font-bold">Fav</span>,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${jetbrainsMono.variable} w-full h-full`}
    >
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon-32x32.png?v=2" type="image/png" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />

        <meta name="theme-color" content="#ffffff"></meta>
        <Script
          async={true}
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC29O3V2UZXXIUWbHI6vR9Seki2TJyOerA&libraries=places&language=ko`}
        />
      </head>
      <body className="duration-300">
        <AuthProvider>
          <QueryProvider>
            <ReduxProvider>
              <UIProvider>
                <div id="header" className="dark:bg-[#1e1e1e] shadow-md  ">
                  <TopView />
                  <TabView tabViewItems={tabViewItemData} />
                </div>

                <div id="PageView">
                  <ErrorBoundryWrapper>{children}</ErrorBoundryWrapper>
                </div>
              </UIProvider>
            </ReduxProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
