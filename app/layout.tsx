import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Train AI Models on the Web",
  description: "Train AI Models on the Web",
};

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
