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
      if (site.currentOrg.name !== route.params.org)
        router.push({ params: { org: site.currentOrg.name } });
    }
  );
  const orgs = useOrgList({
    enabled: true,
    refetchInterval: false,
  });

  return computed(() => {
    if (route.params.org && route.params.org !== site.currentOrg.name) {
      if (orgs.data.value && orgs.isSuccess) {
        const found = orgs.data.value?.find((o) => o.name === route.params.org);
        if (!found) {
          console.error("Org not found - may have moved:", route.params.org);
          router.push({ name: "OrgNotFound" });
        }
        return found || site.currentOrg;
      }
      return site.currentOrg;
    } else {
      return site.currentOrg;
    }
  });

  // if current org changes, update the route.
}
