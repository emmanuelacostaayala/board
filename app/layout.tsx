import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import MigrationListener from "@/components/MigrationListener";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://boardlatinoamericanodeperfusion.com"),
  title: {
    default: "Board Latinoamericano de Perfusión",
    template: "%s | Board Latinoamericano de Perfusión"
  },
  description: "Certificación Profesional en Perfusión Cardiovascular. Únete a los profesionales certificados en toda Latinoamérica.",
  keywords: ["Perfusion", "Board Latinoamericano", "Certificación", "Cardiovascular", "Salud", "Medicina", "Latinoamérica"],
  authors: [{ name: "Board Latinoamericano de Perfusión" }],
  creator: "Board Latinoamericano de Perfusión",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: "https://boardlatinoamericanodeperfusion.com",
    siteName: "Board Latinoamericano de Perfusión",
    title: "Board Latinoamericano de Perfusión",
    description: "Certificación Profesional en Perfusión Cardiovascular",
    images: [
      {
        url: "/images/favicon.png", // Using existing asset, ideally should be a larger OG image
        width: 800,
        height: 600,
        alt: "Logo Board Latinoamericano de Perfusión",
      }
    ]
  },
  icons: {
    icon: "/images/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} antialiased`}>
        <ClerkProvider appearance={{ variables: { colorPrimary: '#fe5933' } }}>
          <MigrationListener />
          <Navbar />
          {children}
          <Toaster />
          <Footer /> {/* 👈 Añade el footer */}
        </ClerkProvider>
      </body>
    </html>
  );
}