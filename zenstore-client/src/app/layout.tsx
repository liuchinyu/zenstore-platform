// 全域配置，定義整個頁面的骨架
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/custom-bootstrap.scss";
import "../styles/style.scss";
import "../styles/components.scss";
import "../styles/page.scss";
import Script from "next/script";
import { Providers } from "@/components/Provider";
import { GA_TRACKING_ID } from "@/lib/gtag";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";
// import GlobalLinkInterceptor from "@/components/GlobalLinkInterceptor/GlobalLinkInterceptor";

// 字體設定
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 定義title
export const metadata: Metadata = {
  // title: "增你強線上商城 ZT Store", // 如果沒特別指定，各網頁分頁名稱都會是這個
  description: "增你強 ZT Store - 提供高品質電子零件與解決方案",
  title: {
    default: "增你強線上商城 ZT Store",
    template: "%s | ZT Store", // 這會讓商品頁只需提供 "iPhone 15"，標題會自動變成 "iPhone 15 | ZT Store"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
          integrity="sha512-dPXYcDub/aeb08c63jRq/k6GaKccl256JQy/AnOq7CAnEZ9FzSL9wSbcZkMp4R26vBsMLFYH4kQ67/bbV8XaCQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          {/* <GlobalLinkInterceptor /> */}
          <Header />
          {children}
          <Footer />
          <GlobalLoading />
        </Providers>

        {/* GA4 追蹤程式碼 */}
        {/* {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )} */}

        {/* <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        /> */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
        ></Script>
      </body>
    </html>
  );
}
