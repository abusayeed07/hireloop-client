import React from "react";
import CompanyProfile from "./CompanyProfile";
import { getUserSession } from "@/lib/core/session";
import { getRecruiterCompany } from "@/lib/api/companies";

const CompanyPage = async () => {
  const user = await getUserSession();
  const company = await getRecruiterCompany(user?.id);

  console.log("User session in CompanyPage", user);

  return (
    <div>
      <CompanyProfile recruiter={user} recruiterCompany={company}></CompanyProfile>
    </div>
  );
};

export default CompanyPage;
