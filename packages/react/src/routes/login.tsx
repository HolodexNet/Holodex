import { LoginButtons } from "@/components/login/LoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const {
    login: { mutate },
  } = useAuth();

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center gap-4">
      <LoginButtons />
    </div>
  );
}
