import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mayur Masala Center",
  description: "Sales, purchase & expense tracker",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MM Center" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#B4182A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/mayurmasala/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MM Center" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23B4182A' rx='32'/%3E%3Ctext x='96' y='130' font-size='100' font-weight='bold' text-anchor='middle' fill='white' font-family='system-ui'%3EMM%3C/text%3E%3C/svg%3E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="MM Center" />
      </head>
      <body className="bg-masala-cream text-masala-brown min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}