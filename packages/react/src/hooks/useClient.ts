import { tokenAtom } from "@/store/auth";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { atom, useAtomValue } from "jotai";

const axiosInstance = axios.create();

export const clientAtom = atom((get) => {
  const token = get(tokenAtom);

  const r = function <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {

    const configWithUser: AxiosRequestConfig = {
      baseURL: `${window.location.protocol}//${window.location.host}/api/v2`,
      ...config,
      headers: {
        ...config?.headers,
        ...token && { Authorization: `Bearer ${token}`, },
      },
      paramsSerializer: (params) => new URLSearchParams(params).toString(),
    };

    return axiosInstance(url, configWithUser);
  }

  r.loggedIn = !!token

  return r;
});

export function useClient() {
  return useAtomValue(clientAtom)
}