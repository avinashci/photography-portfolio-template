import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WebVitalsProvider } from "@/components/providers/WebVitalsProvider";
import { SITE_CONFIG, DERIVED_CONFIG } from "@/config/site.config";

import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url.base),
    title: DERIVED_CONFIG.fullSiteTitle,
    description: SITE_CONFIG.site.description,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${playfairDisplay.variable}`}
        >
            <body>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                    disableTransitionOnChange
                >
                    <WebVitalsProvider>
                        {children}
                    </WebVitalsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
