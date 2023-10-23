import { UseMutationOptions, useMutation } from "@tanstack/react-query";

type ReportOptions =
  | {
      type: "video";
      videoId: string;
    }
  | {
      type: "channel";
      videoId?: never;
    }
  | {
      type: "contact";
      videoId?: never;
    };

export function useReportMutation(
  { type, videoId }: ReportOptions,
  options?: UseMutationOptions<unknown, Error, HolodexReportBody<typeof type>>,
) {
  let endpoint: string;

  switch (type) {
    case "video":
      endpoint = `/api/v2/reports/video/${videoId}`;
      break;

    case "channel":
      endpoint = "/api/v2/reports/channel";
      break;

    case "contact":
      endpoint = "/api/v2/reports/contact";
      break;

    default:
      throw new Error("Report type is not specified");
  }

  return useMutation<unknown, Error, HolodexReportBody<typeof type>>({
    mutationFn: async (body) =>
      // use plain fetch cuz response is not json
      {
        const res = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!res.ok)
          return Promise.reject({
            data: await res.text(),
            statusText: res.statusText,
            statusCode: res.status,
            response: res,
          });
      },
    ...options,
  });
}
