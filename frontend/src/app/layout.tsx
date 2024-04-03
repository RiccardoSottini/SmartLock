import React from "react";
import { AppProvider } from "./context/AppProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";

/* Setup style for the body element */
const inter = Inter({ subsets: ["latin"] });

/* Metadata of the website */
export const metadata: Metadata = {
  title: "Smart Door",
  description: "",
};

/* RootLayout React component - initial component that is rendered */
const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" className="h-100">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
