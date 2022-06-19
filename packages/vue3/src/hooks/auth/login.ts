import { useSiteStore } from "@/stores";
import { useToast } from "vue-toast-notification";
import { LoginResponse } from "./user";

export function useClientLogin() {
  const site = useSiteStore();
  const { open: toast } = useToast();
  // const location = useLocation();
  const onFailure = (err: any) => {
    console.log("Error", err);
    toast({
      position: "top-right",
      message: "Error while logging in",
      type: "error",
    });
    site.user = null;
    site.jwtToken = null;
  };

  async function onGoogleSuccess({ credential }: { credential: string }) {
    try {
      const token = await getToken({
        authToken: credential,
        service: "google",
      });
      const { jwt, user } = token;
      site.jwtToken = jwt;
      site.user = user;
      console.log(user, site);
    } catch (e) {
      onFailure(e);
    }
  }

  async function onDiscordSuccess(
    err: any,
    { access_token }: { access_token: string }
  ) {
    if (err) return onFailure(err);
    try {
      const token = await getToken({
        authToken: access_token,
        service: "discord",
      });
      const { jwt, user } = token;
      site.jwtToken = jwt;
      site.user = user;
    } catch (e) {
      onFailure(e);
    }
  }

  const onTwitterSuccess = async (err: any, out: { jwt: string }) => {
    if (err) return onFailure(err);
    try {
      const twitterTempJWT = out.jwt;
      const token = await getToken({
        authToken: twitterTempJWT,
        service: "twitter",
      });
      const { jwt, user } = token;
      site.jwtToken = jwt;
      site.user = user;
    } catch (e) {
      onFailure(e);
    }
  };

  return { onDiscordSuccess, onGoogleSuccess, onTwitterSuccess };
}

export async function getToken({
  authToken,
  service,
  jwt,
}: {
  authToken: string;
  service: string;
  jwt?: string;
}): Promise<LoginResponse> {
  const headers = {
    "content-type": "application/json",
    ...(jwt && { Authorization: `Bearer ${jwt}` }),
  };
  const body = {
    token: authToken,
    service,
  };
  const res = await fetch(`${window.location.origin}/api/v2/user/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw Error("Failed to acquire token");
  return res.json();
}
