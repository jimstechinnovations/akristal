import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "react-hot-toast";
import { SuppressWebCryptoWarning } from "@/components/suppress-webcrypto-warning";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TheAkristalGroup - REDEFINING REAL ESTATE",
  description: "Find your dream property in Rwanda. Browse residential, commercial, land, and rental properties.",
  icons: {
    icon: [
      { url: '/Akristal-svg.svg', type: 'image/svg+xml' },
      { url: '/Akristal-svg.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: '/Akristal-svg.svg',
    apple: '/Akristal-svg.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (
                    message.includes('WebCrypto API is not supported') ||
                    message.includes('Code challenge method will default to use plain instead of sha256')
                  ) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
        <SuppressWebCryptoWarning />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-white dark:bg-[#0f172a] transition-colors">
            <Navbar />
            <main className="flex-1 bg-white dark:bg-[#0f172a] text-gray-950 dark:text-gray-50 transition-colors">{children}</main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
