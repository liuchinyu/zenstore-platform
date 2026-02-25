import React from "react";
import AccountMenu from "@/components/AccountMenu/AccountMenu";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 col-md-3 mb-4 mb-md-0">
            <AccountMenu />
          </div>
          <div className="col-12 col-md-9">{children}</div>
        </div>
      </div>
    </>
  );
}
