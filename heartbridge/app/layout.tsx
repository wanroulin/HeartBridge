import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HeartBridge 心橋 - 親子匿名交流平台',
  description: '促進親子之間的理解與溝通',
};

export default function RootLayout ({
  children,
} : {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}