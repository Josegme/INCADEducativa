import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INCADEducativa",
  description:
    "Plataforma Educativa Digital de la Escuela de Negocios INCADE — Posadas, Misiones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
