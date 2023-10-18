import { defaultOrgs } from "@/store/org";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export function useOrgs(config?: UseQueryOptions<Org[], Error>) {
  return useQuery<Org[], Error>(
    ["orgs"],
    async () =>
      fetch(`${window.location.origin}/statics/orgs.json`).then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! Status: ${r.status}`);
        }
        return r.json();
      }),
    {
      placeholderData: defaultOrgs,
      ...config,
    },
  );
}
