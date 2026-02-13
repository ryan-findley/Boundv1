import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bound - Safe AI for Kids",
  description: "A parent-controlled, AI-powered learning experience for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
