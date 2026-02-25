import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/custom-bootstrap.scss";
import "../styles/style.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from "next/script";
import { Providers } from "../components/Providers";
import SidebarMenu from "../components/Menu/SidebarMenu";
import GoogleAnalytics from "../components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "增你強電商後台管理",
  description: "增你強電商後台管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="container-fluid bg-color">
          <div className="row">
            <div className="col-auto p-0 sidebar-wrapper">
              <div className="sidebar-container h-100">
                <SidebarMenu />
              </div>
            </div>
            <div className="col content-col">
              <Providers>{children}</Providers>
            </div>
          </div>
        </div>

        <GoogleAnalytics />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
