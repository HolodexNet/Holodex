import { atomWithStorage } from "jotai/utils";

export const userAtom = atomWithStorage<User | null>('user', null);
export const tokenAtom = atomWithStorage<string | null>('token', null);