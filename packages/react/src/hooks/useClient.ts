import { createFetchClient } from "@/lib/fetch";
import { tokenAtom } from "@/store/auth";
import { atom, useAtomValue } from "jotai";

/**
 * An atom that provides an authenticated fetch client.
 *
 * @return {FetchClient} An authenticated fetch client.
 */
export const clientAtom = atom((get) => {
  const token = get(tokenAtom);
  const fetch = createFetchClient(token);
  return fetch;
});

/**
 * Hook that provides an authenticated fetch client.
 *
 * @return {FetchClient} An authenticated fetch client.
 */
export function useClient() {
  return useAtomValue(clientAtom);
}
