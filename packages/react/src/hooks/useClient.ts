import { tokenAtom } from "@/store/auth";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAtomValue } from "jotai";
import { useCallback } from "react";

const axiosInstance = axios.create();

export function useClient() {
  const token = useAtomValue(tokenAtom);

  const AxiosInstance = useCallback(
    function <T>(
      url: string,
      config?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>> {
      const configWithUser: AxiosRequestConfig = {
        baseURL: `${window.location.protocol}//${window.location.host}/api/v2`,
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token}`,
        },
        paramsSerializer: {
          serialize: (params) => new URLSearchParams(params).toString(),
        },
      };
      return axiosInstance(url, configWithUser);
    },
    [token],
  );

  return AxiosInstance;
}
