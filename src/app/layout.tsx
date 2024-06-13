import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Emilie Joos",
  description: "By Sebastien Gault",
};


export default function RootLayout({
  children, params
}: Readonly<{
  children: React.ReactNode;
  params: string
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        </body>
    </html>
  );
}
