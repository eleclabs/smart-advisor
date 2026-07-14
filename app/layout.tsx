import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export const metadata: Metadata = {
  title: "Smart Advisor",
  description: "ระบบดูแลช่วยเหลือและติดตามผู้เรียนสำหรับสถานศึกษา",
  icons: {
    icon: '/vea-logo.svg',
    apple: '/vea-logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="layout">

        <Navbar />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
