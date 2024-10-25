import { useChannelReportMutation } from "@/services/reports.service";
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
import { LanguagePicker } from "./LanguagePicker";

const formValues = {
  link: "",
  language: "",
  twitter: "",
  contact: "",
  comments: "",
};

export function AddSubberForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: formValues,
  });
  const { mutate, isPending } = useChannelReportMutation({
    onSuccess: () => {
      console.log("Subber Channel request has been sent successfully");
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
  });

  const onSubmit: SubmitHandler<typeof formValues> = async ({
    link,
    language,
    twitter,
    comments,
    contact,
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
                "I'd like to ➕ add a clipping/subbing channel to Holodex.",
              inline: false,
            },
            {
              name: "Channel Link",
              value: link,
              inline: false,
            },
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
            comments
              ? {
                  name: "Comments",
                  value: comments,
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
              __html: t("channelRequest.ClipperRequirementText"),
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
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("channelRequest.ChannelLanguageLabel")}</FormLabel>
              <FormControl>
                <LanguagePicker name="language" form={form} field={field} />
              </FormControl>
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
              isPending ? "i-lucide:loader-2 animate-spin" : "i-lucide:check"
            }
          />
          {t("channelRequest.sendRequest")}
        </Button>
      </form>
    </Form>
  );
}
