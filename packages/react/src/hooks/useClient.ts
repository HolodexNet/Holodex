import { createFetchClient } from "@/lib/fetch";
import { tokenAtom } from "@/store/auth";
import { atom, useAtomValue } from "jotai";

export const clientAtom = atom((get) => {
  const token = get(tokenAtom);
  const fetch = createFetchClient(token);
  return fetch;
});

export function useClient() {
  return useAtomValue(clientAtom);
}
