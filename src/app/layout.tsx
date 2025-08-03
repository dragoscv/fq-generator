import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Professional Frequency Generator | Audio Signal Generator & Tone Generator",
  description: "Professional-grade frequency generator and audio signal tester. Generate sine, square, sawtooth, and triangle waves from 1Hz to 20kHz. Perfect for audio testing, calibration, and sound engineering.",
  keywords: "frequency generator, tone generator, audio signal generator, sine wave, square wave, sawtooth wave, triangle wave, audio testing, sound calibration, web audio api",
  authors: [{ name: "Dragos" }],
  creator: "Dragos",
  publisher: "Dragos",
  applicationName: "Professional Frequency Generator",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fq-generator.vercel.app",
    title: "Professional Frequency Generator | Audio Signal Generator & Tone Generator",
    description: "Professional-grade frequency generator and audio signal tester. Generate sine, square, sawtooth, and triangle waves from 1Hz to 20kHz. Perfect for audio testing, calibration, and sound engineering.",
    siteName: "Professional Frequency Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Professional Frequency Generator - Audio Signal Generator & Tone Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Frequency Generator | Audio Signal Generator & Tone Generator",
    description: "Professional-grade frequency generator and audio signal tester. Generate sine, square, sawtooth, and triangle waves from 1Hz to 20kHz.",
    images: ["/og-image.png"],
    creator: "@dragoscv",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://fq-generator.vercel.app"),
  alternates: {
    canonical: "/",
  },
  category: "Audio Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <main className="min-h-full">
          {children}
        </main>
        <footer className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 border-t border-white/10 dark:border-slate-700/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Built with{" "}
                  <a 
                    href="https://claude.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Claude
                  </a>
                  {" "}by{" "}
                  <a 
                    href="https://github.com/dragoscv" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Dragos
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/dragoscv/fq-generator" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Source
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
