import { useOrgList } from "@/services/static";
import { useSiteStore } from "@/stores/site";
import { Ref } from "vue";

/**
 * Synchronizes router param with currentOrg from siteState.
 */
export default function useOrgRouteParamSync(): Ref<Org> {
  const site = useSiteStore();
  const router = useRouter();
  const route = useRoute();
  // if the route ORG is not currentorg upon page entry,
  watch(
    () => site.currentOrg,
    () => {
      if (route.name === "Search") return; // ignore
      if (site.currentOrg.name !== route.params.org)
        router.push({ params: { org: site.currentOrg.name } });
    },
  );
  const orgs = useOrgList({
    enabled: computed(
      () => !!route.params.org && route.params.org !== site.currentOrg.name,
    ),
    refetchInterval: false,
  });

  return computed(() => {
    if (route.name === "Search") return site.currentOrg; // ignore

    if (route.params.org && route.params.org !== site.currentOrg.name) {
      if (orgs.data.value && orgs.isSuccess) {
        // Special handle case for fake org
        if (route.params.org === "All Vtubers") {
          return { short: "Vtuber", name: "All Vtubers" };
        }
        const found = orgs.data.value?.find((o) => o.name === route.params.org);
        if (!found) {
          console.error("Org not found - may have moved:", route.params.org);
          router.push({ name: "OrgNotFound" });
          throw new Error("Org not found - may have moved.");
        }
        return found;
      }
      return { ...site.currentOrg, name: route.params.org as string };
      // for a millisecond, return the WRONG Org object. (this will quickly be replaced with 'found')
    } else {
      return site.currentOrg;
    }
  });

  // if current org changes, update the route.
}
