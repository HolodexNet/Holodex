import { AC_Topic } from "@/components/header/searchbar/types";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_TOPICS = [
  {
    id: "morning",
  },
  {
    id: "genshin",
  },
  {
    id: "Pokemon",
  },
  {
    id: "drawing",
  },
  {
    id: "valorant",
  },
  {
    id: "watchalong",
  },
  {
    id: "Splatoon",
  },
  {
    id: "monhun",
  },
  {
    id: "GTA",
  },
  {
    id: "Mario_Kart",
  },
  {
    id: "among_us",
  },
  {
    id: "Birthday",
  },
  {
    id: "Anniversary",
  },
  {
    id: "ark",
  },
];

export function useTopics(config?: CommonQueryConfig) {
  return useQuery<AC_Topic[], Error>({
    queryKey: ["topics"],
    queryFn: async () =>
      fetch(`${window.location.origin}/api/v2/topics`).then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! Status: ${r.status}`);
        }
        return r.json();
      }),
    placeholderData: DEFAULT_TOPICS,
    ...config,
  });
}
