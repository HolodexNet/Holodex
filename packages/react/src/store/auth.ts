import { GET_ON_INIT } from "@/lib/consts";
import { atomWithStorage } from "jotai/utils";

export const userAtom = atomWithStorage<User | null>(
  "user",
  null,
  undefined,
  GET_ON_INIT,
);
export const tokenAtom = atomWithStorage<string | null>(
  "token",
  null,
  undefined,
  // we need this atom to be populated from localStorage before first use, or
  // tasks like `createFetchClient` will fail from receiving a null token
  // see: https://github.com/pmndrs/jotai/discussions/1999
  GET_ON_INIT,
);
