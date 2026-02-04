import type { Metadata } from "next";
import localFont from "next/font/local";

// import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { AuthProvider } from "@/features/auth/auth-context";

import { Modals } from "@/components/modals";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { JotaiProvider } from "@/components/jotai-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Slack Mini",
  description: "A mini version of Slack. Easy to use, easy to love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ConvexAuthNextjsServerProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <AuthProvider>
            <JotaiProvider>
              <Toaster />
              <Modals />
              <NuqsAdapter>{children}</NuqsAdapter>
            </JotaiProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
    // </ConvexAuthNextjsServerProvider>
  );
}
