import { defaultOrgs } from "@/store/org";
import { useQuery } from "@tanstack/react-query";

export function useOrgs(config?: CommonQueryConfig) {
  return useQuery<Org[], Error>({
    queryKey: ["orgs"],
    queryFn: async () =>
      fetch(`${window.location.origin}/statics/orgsV2.json`).then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! Status: ${r.status}`);
        }
        return r.json();
      }),
    placeholderData: defaultOrgs,
    staleTime: 60 * 60 * 1000,
    ...config,
  });
}
