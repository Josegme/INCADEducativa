import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import "./globals.css";

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
    <html lang="es" className="dark">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
