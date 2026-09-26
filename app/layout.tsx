import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "BULLET — The Pure Motorcycling Experience",
  description:
    "Sit on a Royal Enfield Bullet. Endless road. Endless thump. Immersive ride experience with road-trip music.",
  applicationName: "BULLET",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${bebas.variable} h-full`}>
      <body className="h-full overflow-hidden antialiased">{children}</body>
    </html>
  );
}
