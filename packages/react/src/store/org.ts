import { GET_ON_INIT } from "@/lib/consts";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const defaultOrgs = [
  { name: "Hololive", short: "Holo" },
  { name: "Nijisanji", short: "Niji" },
  { name: "VSpo", short: "VSpo" },
  { name: "Independents", short: "Indie" },
  { name: "All Vtubers", short: "Vtuber" },
];

export const orgRankingAtom = atomWithStorage<Org[]>(
  "orgRanking",
  defaultOrgs,
  undefined,
  GET_ON_INIT,
);

export const currentOrgAtom = atomWithStorage<Org>("org", {
  name: "Hololive",
  short: "Holo",
});

export const orgAtom = atom((get) => get(currentOrgAtom).name);
