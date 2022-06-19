import { useSiteStore } from "@/stores";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
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
    site.jwtToken = undefined;
    site.user = undefined;
  };

  const checkAndRefreshUser = async () => {
    if (!token) return;
    try {
      const resp = await AxiosInstance<User>("/user/check");
      if (resp.status === 200 && resp.data?.id) site.user = resp.data as User;
      else throw new Error("Strange bug occured with user checking...");
    } catch (e) {
      logout();
      toast({
        position: "top-right",
        message: "Error while logging in",
        type: "error",
      });
      return false;
    }
    return true;
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
