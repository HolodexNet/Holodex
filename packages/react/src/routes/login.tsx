import { LoginButtons } from "@/components/login/LoginButtons";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("component.mainNav.login")} - Holodex</title>
      </Helmet>
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center gap-4">
        <LoginButtons />
      </div>
    </>
  );
}
