import { useSiteStore } from "@/stores";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useToast } from "vue-toast-notification";
import { User } from "./user";

// TODO: change?
const BASE_URL = window.location.origin + "/api/v2/";

export function useClient() {
  const { open: toast } = useToast();
  const site = useSiteStore();
  const isLoggedIn = !!site.user;
  const user = site.user;
  const token = site.jwtToken;

  const AxiosInstance = function <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const configWithUser: AxiosRequestConfig = {
      baseURL: BASE_URL,
      ...config,
      headers: {
        ...config?.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
    return axios(url, configWithUser);
  };

  const logout = () => {
    site.jwtToken = null;
    site.user = null;
  };

  const checkAndRefreshUser = async () => {
    if (!token) return;
    return new Promise<void>((resolve, _) => {
      AxiosInstance<{ user: User; jwt: string }>("/user/refresh")
        .then((resp) => {
          if (resp.data?.user?.id) {
            site.user = resp.data.user;
            site.jwtToken = resp.data.jwt;
          } else {
            throw new Error("Strange bug occured with user checking...");
          }
        })
        .catch((error: Error | AxiosError) => {
          if ((error as AxiosError)?.response) {
            const { data, status, headers } = (error as AxiosError)
              .response as AxiosResponse;
            // Request made and server responded
            console.log(data);
            console.log(status);
            console.log(headers);

            if (status === 401) {
              logout();
              toast({
                position: "top-right",
                message: "You have been logged out.",
                type: "error",
              });
            }
          } else if ((error as AxiosError)?.request) {
            // The request was made but no response was received
            console.log("The request was made but no response was received");
            toast({
              position: "top-right",
              message: "Server inaccessible, please try again later.",
            });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
            toast({
              position: "top-right",
              message: "Mysterious error occured.",
              type: "error",
            });
          }
        })
        .finally(resolve);
    });
  };

  return {
    isLoggedIn,
    user,
    token,
    AxiosInstance,
    checkAndRefreshUser,
    logout,
  };
}
