import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const defaultOrgs = [
  { name: "All Vtubers", short: "Vtuber" },
  { name: "Hololive", short: "Holo" },
  { name: "Nijisanji", short: "Niji" },
  { name: "VSpo", short: "VSpo" },
  { name: "Independents", short: "Indie" },
];

export const orgRankingAtom = atomWithStorage<Org[]>("orgRanking", defaultOrgs);

export const currentOrgAtom = atomWithStorage<Org>("org", {
  name: "Hololive",
  short: "Holo",
});

export const orgAtom = atom((get) => get(currentOrgAtom).name);
