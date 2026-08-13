import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Metadata from "@/components/Metadata";
// ✅ Import the AI Assistant component
import AIAssistant from "@/components/ai/AIAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ ADDED THIS METADATA BLOCK
export const metadata = {
  title: "HireLoop",
  description: "Find your dream job or top talent.",
  icons: {
    icon: "/icon.svg", // Tells Next.js to use the icon.svg file you create in src/app
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Metadata />
        {children}

        <Toaster position="top-right" />
        
        {/* ✅ AI Assistant - Available on all pages */}
        <AIAssistant />
      </body>
    </html>
  );
}