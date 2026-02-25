"use client";
import { useState } from "react";
import PersonalForm from "@/components/Forms/Person/PersonalForm";
import CompanyForm from "@/components/Forms/Company/CompanyForm";

type accountType = "personal" | "company";

export default function Register() {
  const [accountType, setAccountType] = useState<accountType>("personal");

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAccountType(e.target.value as accountType);
  };

  return (
    <>
      <div className="auth_registerContainer">
        <h2 className="text-center pt-2 d-block h4">免費註冊 ZTSTORE 會員</h2>
        <div className="container">
          <div className="row ">
            <div className="col-12 d-flex justify-content-center">
              <div style={{ width: "70%" }}>
                <small className="d-block mb-2">
                  <span className="text-danger">*</span>所有欄位必填
                </small>
                <div className="form-group mb-3">
                  <label
                    className="form-label"
                    style={{ fontSize: "14px" }}
                    htmlFor="accountType"
                  >
                    會員類別 <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    aria-label="select account type"
                    id="accountType"
                    style={{ marginTop: "-5px" }}
                    value={accountType}
                    onChange={handleAccountTypeChange}
                  >
                    <option value="personal">個人會員</option>
                    <option value="company">企業會員</option>
                  </select>
                </div>

                {accountType === "personal" ? (
                  <PersonalForm />
                ) : (
                  <CompanyForm />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
