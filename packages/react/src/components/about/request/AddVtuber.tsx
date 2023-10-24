import { useReportMutation } from "@/services/reports.service";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";
import { Button } from "@/shadcn/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import { useToast } from "@/shadcn/ui/use-toast";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const formValues = {
  link: "",
  english_name: "",
  language: "",
  org: "",
  twitter: "",
  contact: "",
  comments: "",
};

export function AddVtuberForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: formValues,
  });
  const { mutate, isPending } = useReportMutation(
    { type: "channel" },
    {
      onSuccess: () => {
        console.log("Channel request has been sent successfully");
        toast({
          title: t("channelRequest.sendSuccess"),
        });
      },
      onError: (err) => {
        toast({
          variant: "error",
          title: t("channelRequest.sendError"),
          description: err.message,
        });
      },
    },
  );

  const onSubmit: SubmitHandler<typeof formValues> = async ({
    link,
    english_name,
    language,
    twitter,
    comments,
    contact,
    org,
  }) => {
    const regex =
      /(?:https?:\/\/)(?:www\.)?youtu(?:be\.com\/)(?:channel)\/([\w\-_]*)/gi;
    const matches = [...link.matchAll(regex)];
    const id = matches?.[0]?.[1];

    const res = await fetch(`/api/v2/channels/${id}`);
    if (res.ok && (await res.json()).id) return navigate(`/channel/${id}`);

    mutate({
      content: "Look what the cat dragged in...",
      embeds: [
        {
          title: "Holodex New Subber Request",
          color: 1955806,
          fields: [
            {
              name: "Report Type",
              value:
                "Add a Vtuber ▶️ for Holodex to track the channel and clips.",
              inline: false,
            },
            {
              name: "Channel Link",
              value: link,
              inline: false,
            },
            english_name
              ? {
                  name: "Alternate Channel Name (optional)",
                  value: english_name,
                  inline: false,
                }
              : [],
            language
              ? {
                  name: "What language is your channel?",
                  value: language,
                  inline: false,
                }
              : [],
            twitter
              ? {
                  name: "Twitter Handle (optional)",
                  value: twitter,
                  inline: false,
                }
              : [],
            contact
              ? {
                  name: "Direct contact",
                  value: contact,
                  inline: false,
                }
              : [],
            org || comments
              ? {
                  name: "Comments",
                  value: `[${org}] ${comments}`,
                }
              : [],
          ].flat(),
          footer: {
            text: "Holodex UI",
          },
        },
      ],
    });
  };

  const onInvalid: SubmitErrorHandler<typeof formValues> = () => {
    toast({
      title: t("channelRequest.sendError"),
      variant: "error",
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
      >
        <Alert variant="primary">
          <div className="i-icon-park-outline:guide-board text-2xl" />
          <AlertDescription
            dangerouslySetInnerHTML={{
              __html: t("channelRequest.VtuberRequirementText"),
            }}
          />
        </Alert>
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.ChannelURL")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/..."
                  {...field}
                  {...form.register("link", {
                    required: {
                      value: true,
                      message: t("channelRequest.required"),
                    },
                    pattern: {
                      value:
                        /(?:https?:\/\/)(?:www\.)?youtu(?:be\.com\/)(?:channel)\/([\w\-_]*)/gi,
                      message: t("channelRequest.ChannelURLErrorFeedback"),
                    },
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="english_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.EnglishNameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>
                {t("channelRequest.EnglishNameHint")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.ChannelLanguageLabel")}</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="org"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.VtuberGroupLabel")}</FormLabel>
              <FormControl>
                <Input placeholder="Hololive, Nijisanji, ..." {...field} />
              </FormControl>
              <FormDescription>
                {t("channelRequest.VtuberGroupHint")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.TwitterHandle")}</FormLabel>
              <FormControl>
                <Input placeholder="@xyzabc" {...field} />
              </FormControl>
              <FormDescription>@username</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.DirectContactLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="@abc / discord#1234 / (email 😞)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("channelRequest.DirectContactDisclaimer")}
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.Comments")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                {t("channelRequest.CommentsHint")}
              </FormDescription>
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit" className="w-full">
          <div
            className={
              isPending ? "i-lucide:loader-2 animate-spin" : "i-heroicons:check"
            }
          />
          {t("channelRequest.sendRequest")}
        </Button>
      </form>
    </Form>
  );
}
