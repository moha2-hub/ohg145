import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MohStore - Multi-Role E-commerce Platform",
  description: "A multi-role e-commerce platform with admin, seller, and customer dashboards",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  )
}
