import Script from "next/script";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HFC Admin",
  description: "HFC Admin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "window.globalThis = window" }}
          type="text/javascript"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
