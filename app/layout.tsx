import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import {
  APP_DESCRIPTION,
  APP_NAME,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
} from "@/shared/constants";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
