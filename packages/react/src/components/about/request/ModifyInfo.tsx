import { useChannelReportMutation } from "@/services/reports.service";
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
import { ChannelPicker } from "../../channel/ChannelPicker";
import { LanguagePicker } from "./LanguagePicker";

const formValues = {
  channel: {
    id: "",
    name: "",
    link: "",
    type: "",
  },
  language: "",
  org: "",
  twitter: "",
  contact: "",
  comments: "",
};

export function ModifyInfoForm() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: formValues,
  });
  const { mutate, isPending } = useChannelReportMutation({
    onSuccess: () => {
      console.log("Channel modify request has been sent successfully");
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
    channel,
    language,
    org,
    twitter,
    comments,
    contact,
  }) => {
    mutate({
      content: "Look what the cat dragged in...",
      embeds: [
        {
          title: "Holodex New Subber Request",
          color: 1955806,
          fields: [
            {
              name: "Report Type",
              value: "I'd like to modify existing channel",
              inline: false,
            },
            {
              name: "Channel Link",
              value: channel.link,
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

  const channelType = form.watch("channel.type");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="channel.id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Channel</FormLabel>
              <FormControl>
                <ChannelPicker
                  form={form}
                  value={field.value}
                  name="channel.name"
                  type="any_channel"
                  onSelect={({ name, id, type }) => {
                    form.setValue("channel.id", id);
                    form.setValue("channel.name", name);
                    form.setValue(
                      "channel.link",
                      `https://www.youtube.com/channel/${id}`,
                    );
                    form.setValue("channel.type", type); // need to modify server to emit this.
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {channelType === "subber" && (
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("channelRequest.ChannelLanguageLabel")}
                </FormLabel>
                <FormControl>
                  <LanguagePicker name="language" form={form} field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {channelType === "vtuber" && (
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
        )}
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