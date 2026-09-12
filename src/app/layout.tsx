import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "INCADEducativa",
  description:
    "Plataforma Educativa Digital de la Escuela de Negocios INCADE — Posadas, Misiones.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#08080F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable}`}>
      <body className={inter.className}>
        <TooltipProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </TooltipProvider>
      </body>
    </html>
  );
}
