
import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "./components/SessionWrapper";
import { Toaster } from "@pheralb/toast";
import ClientProviders from "./components/ClientProvider";
import { ClientInitializer } from "./components/ClientInitializer";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aplicación para manejo escolar",
  description: "Aplicación para el manejo de datos escolares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ClientProviders>
            <SessionWrapper>
              <Providers>
              <ClientInitializer />
              {children}
              <Toaster theme="light" />
              </Providers>
            </SessionWrapper>
          </ClientProviders>
      </body>
    </html>
  );
}
