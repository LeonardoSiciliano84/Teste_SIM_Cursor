import React from "react";
import { useSearchParams } from "react-router-dom";
import PasswordReset from "../components/auth/password-reset";

const PasswordResetPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || undefined;
  return <PasswordReset token={token} />;
};

export default PasswordResetPage;
