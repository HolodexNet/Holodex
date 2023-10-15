import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/shadcn/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import open from "oauth-open";

export default function Login() {
  const {
    login: { mutate },
  } = useAuth();

  return (
    <div className="w-full h-full">
      <div className="flex-col gap-4">
        <GoogleLogin
          onSuccess={(credential) => mutate({ platform: "google", credential })}
          onError={() => console.log("Google login failed")}
        />
        <Button
          className="w-full"
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
          Login with Discord
        </Button>
        {/* Twitter login is currently unavailable and is on hold */}
        {/* <Button
          className="w-full"
          onClick={() =>
            (window.location.href = `${window.origin}/api/v2/user/login/twitter`)
          }
        >
          Login with Twitter
        </Button> */}
      </div>
    </div>
  );
}
