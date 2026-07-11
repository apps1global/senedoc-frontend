import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "senedoc — Prenez rendez-vous avec un médecin au Sénégal",
  description:
    "Trouvez un médecin par spécialité, partout au Sénégal, et réservez votre rendez-vous en un instant.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
