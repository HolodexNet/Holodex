import { atomWithStorage } from "jotai/utils";

export const userAtom = atomWithStorage<User | null>("user", null);
export const tokenAtom = atomWithStorage<string | null>(
  "token",
  null,
  undefined,
  // we need this atom to be populated from localStorage before first use, or
  // tasks like `createFetchClient` will fail from receiving a null token
  // see: https://github.com/pmndrs/jotai/discussions/1999
  { getOnInit: true },
);
