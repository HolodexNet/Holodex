import { useQuery } from "@tanstack/react-query";

export function fetchOrgs() {
  return fetch(`${window.location.origin}/statics/orgsV2.json`).then(
    (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    },
  );
}

export function useOrgs(config?: CommonQueryConfig) {
  return useQuery<Org[], Error>({
    queryKey: ["orgs"],
    queryFn: fetchOrgs,
    staleTime: 60 * 60 * 1000,
    ...config,
  });
}
