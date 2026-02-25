// src/app/account/profile/page.tsx
"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/hooks/redux";
import dynamic from "next/dynamic";
import Spinner from "@/components/LoadingSpinner";

// 動態導入企業會員表單
const CompanyProfileForm = dynamic(
  () => import("@/components/Forms/Company/CompanyProfileForm"),
  {
    ssr: false,
    loading: () => <Spinner />,
  }
);

// 動態導入個人會員表單
const PersonProfileForm = dynamic(
  () => import("@/components/Forms/Person/PersonProfileForm"),
  {
    ssr: false,
    loading: () => <Spinner />,
  }
);

export default function Profile() {
  const memberType = useAppSelector((s) => s.auth?.user?.MEMBER_TYPE);
  // const user = useAppSelector((s) => s.auth.user);
  const isCompany = useMemo(() => memberType === "企業會員", [memberType]);

  if (!memberType) return <Spinner />;

  return isCompany ? <CompanyProfileForm /> : <PersonProfileForm />;
}
