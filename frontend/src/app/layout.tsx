import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import AuthInitializer from "./components/AuthInitializer";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SonnerGlobal } from "./components/modern-ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 Project Not Found — Task & Annotation App",
  description:
    "A 2-in-1 app combining a Kanban task manager with a polygon image annotation tool. Built with Next.js and Django.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <AuthInitializer />
          <SonnerGlobal position="top-right" richColors closeButton />
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

