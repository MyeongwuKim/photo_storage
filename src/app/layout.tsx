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
import ToastPotal from "@/components/portal/toastPortal";
import ModalPortal from "@/components/portal/modalPortal";
import AuthProvider from "@/components/authProvider";
import Spinner from "@/components/loading/spinner";
import { QueryProvider } from "@/components/queryProvider";
import Script from "next/script";
import { Inter } from "next/font/google";
import ErrorBoundryWrapper from "@/components/errorBoundryWrapper";

export const metadata: Metadata = {
  title: "Home",
  description: "list photo & video",
};

const inter = Inter({ subsets: ["latin"] });

const tabViewItemData = [
  { content: "", route: "/", icon: <Squares2X2Icon className="w-5 h-5" /> },
  { content: "", route: "/photo", icon: <PhotoIcon className="w-5 h-5" /> },
  {
    content: "",
    route: "/video",
    icon: <VideoCameraIcon className="w-5 h-5" />,
  },
  { content: "", route: "/tag", icon: <TagIcon className="w-5 h-5" /> },
  { content: "", route: "/favorite", icon: <StarIcon className="w-5 h-5" /> },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <head>
        <link rel="shortcut icon" href="/public/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/public/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/public/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/public/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/public/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/public/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/public/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/public/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/public/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/public/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/public/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/public/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/public/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/public/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/public/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#ffffff"></meta>
        <Script
          async={true}
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC29O3V2UZXXIUWbHI6vR9Seki2TJyOerA&libraries=places&language=ko`}
        />
      </head>
      <body className="duration-300">
        <AuthProvider>
          <QueryProvider>
            <div className="flex flex-col">
              <div id="TopView">
                <TopView />
              </div>
              <div id="PageView">
                <TabView tabViewItems={tabViewItemData} />
                <ErrorBoundryWrapper>{children}</ErrorBoundryWrapper>
              </div>
            </div>
            <div id="modal" className="fixed z-[98] top-0">
              <ModalPortal />
            </div>
            <div id="toast" className="fixed z-[98] top-0">
              <ToastPotal />
            </div>
            <Spinner />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
