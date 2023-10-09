import { useToast } from "@/shadcn/ui/use-toast";
import { tokenAtom, userAtom } from "@/store/auth";
import { CredentialResponse } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  jwt: string;
  user: User;
}

type LoginArgs =
  | {
      platform: "google";
      error?: Error;
      credential: CredentialResponse;
      access_token?: never;
      jwt?: never;
    }
  | {
      platform: "discord";
      error?: Error;
      credential?: never;
      access_token: string;
      jwt?: never;
    }
  | {
      platform: "twitter";
      error?: Error;
      credential?: never;
      access_token?: never;
      jwt: string;
    };

export function useAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);

  const login = useMutation(
    async ({
      platform,
      error,
      credential,
      access_token,
      jwt: tempJWT,
    }: LoginArgs) => {
      switch (platform) {
        case "google":
          if (error) return onFailure(error);
          if (!credential.credential)
            return onFailure(new Error("Credential not provided"));
          try {
            const { jwt, user } = await getToken({
              authToken: credential.credential,
              service: "google",
            });
            setToken(jwt);
            setUser(user);
            navigate("/settings");
          } catch (e) {
            onFailure(e as Error);
          }
          break;

        case "discord":
          if (error) return onFailure(error);
          try {
            const { jwt, user } = await getToken({
              authToken: access_token,
              service: "discord",
            });
            setToken(jwt);
            setUser(user);
            navigate("/settings");
          } catch (e) {
            onFailure(e as Error);
          }

          break;

        case "twitter":
          if (error) return onFailure(error);
          try {
            const { jwt, user } = await getToken({
              authToken: tempJWT,
              service: "twitter",
            });
            setToken(jwt);
            setUser(user);
            navigate("/settings");
          } catch (e) {
            onFailure(e as Error);
          }
          break;

        default:
          onFailure(Error("No login method specified"));

          break;
      }
    },
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  const onFailure = useCallback(
    (err: Error) => {
      console.log("[Auth] Login error", err);
      toast({
        variant: "destructive",
        title: "Error while logging in",
      });
      setUser(null);
      setToken(null);
    },
    [setToken, setUser, toast],
  );

  return { login, logout };
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
  const res = await fetch(`/api/v2/user/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw Error("Failed to acquire token");
  return res.json();
}
