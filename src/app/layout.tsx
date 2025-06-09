import "@/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { MobileLayout } from "@/components/layout/mobile-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LaporinPolisi - Laporkan Pelanggaran Hukum",
  description: "Platform untuk melaporkan segala bentuk pelanggaran hukum di Indonesia",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.className}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <MobileLayout>{children}</MobileLayout>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}