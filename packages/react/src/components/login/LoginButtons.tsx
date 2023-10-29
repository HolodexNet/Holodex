import open from "oauth-open";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { GoogleLogin } from "@react-oauth/google";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

export function LoginButtons() {
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const {
    login: { mutate },
  } = useAuth();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {!user?.google_id && (
        <GoogleLogin
          size="large"
          text="signin_with"
          onSuccess={(credential) => mutate({ platform: "google", credential })}
          onError={() => console.log("Google login failed")}
        />
      )}
      {!user?.discord_id && (
        <Button
          size="lg"
          className="w-full bg-iris-7"
          onClick={() =>
            open(
              `https://discord.com/api/oauth2/authorize?client_id=793619250115379262&redirect_uri=${encodeURIComponent(
                `${window.location.protocol}//${window.location.host}/discord`,
              )}&response_type=token&scope=identify`,
              (error: Error, { access_token }: { access_token: string }) =>
                mutate({ platform: "discord", error, access_token }),
            )
          }
        >
          <div className="i-carbon:logo-discord" />
          {t("views.login.with.1")}
        </Button>
      )}
      {/* Twitter login is currently unavailable and is on hold */}
      {/* !user?.twitter_id &&
        <Button
          className="w-full"
          onClick={() =>
            (window.location.href = `${window.origin}/api/v2/user/login/twitter`)
          }
        >
          Login with Twitter
        </Button> */}
    </div>
  );
}
