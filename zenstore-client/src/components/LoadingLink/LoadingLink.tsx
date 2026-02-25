"use client";

import React from "react";
import Link from "next/link";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  delay?: number;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any; // 支援其他 Link 屬性
}

const LoadingLink = ({
  href,
  children,
  className = "",
  loadingText,
  delay,
  onClick,
  ...props
}: LoadingLinkProps) => {
  const { navigateWithLoading } = useGlobalLoading();

  const handleClick = (e: React.MouseEvent) => {
    // 如果有自定義 onClick，先執行
    if (onClick) {
      onClick(e);
    }

    // 如果沒有阻止預設行為(preventDefault())，則執行帶等待動畫的導航
    if (!e.defaultPrevented) {
      navigateWithLoading(href, loadingText, delay);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default LoadingLink;
