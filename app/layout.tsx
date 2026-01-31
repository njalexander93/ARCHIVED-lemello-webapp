import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lemello - Today's recipes. Tomorrow's traditions.",
  description: "Transform from recipe-follower to recipe-creator with AI guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
