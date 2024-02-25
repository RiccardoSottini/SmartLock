import './globals.css'
import 'bootstrap/dist/css/bootstrap.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AppProvider from "./context/AppContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartDoor',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-100">
      <AppProvider>
        <body className={inter.className + " h-100"}>{children}</body>
      </AppProvider>
    </html>
  )
}
