import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVideoReportMutation } from "@/services/reports.service";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaBody,
  CredenzaTitle,
  CredenzaFooter,
  CredenzaClose,
} from "@/shadcn/ui/dialog-drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { TopicPicker } from "@/components/topic/TopicPicker";
import { ChannelPicker } from "@/components/channel/ChannelPicker";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Textarea } from "@/shadcn/ui/textarea";
import { Button } from "@/shadcn/ui/button";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";
import { useToast } from "@/shadcn/ui/use-toast";
import { useParams } from "react-router-dom";

const formSchema = z.object({
  reasons: z.array(z.string()).min(1, {
    message: "Please select at least one reason",
  }),
  comments: z.string().min(20, {
    message: "Comments must be at least 20 characters long",
  }),
  suggestedTopic: z.string().optional(),
  mentionedChannels: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportDialogMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: VideoBase;
}

export function ReportDialogMenu({
  open,
  onOpenChange,
  video,
}: ReportDialogMenuProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentOrg = useParams()?.org;
  const [selectedChannels, setSelectedChannels] = useState<
    SearchAutoCompleteChannel[]
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reasons: [],
      comments: "",
      suggestedTopic: "",
      mentionedChannels: [],
    },
  });

  const { mutate: submitReport, isPending } = useVideoReportMutation(video.id, {
    onSuccess: () => {
      toast({
        title: t("component.reportDialog.success"),
        duration: 3000,
      });
      onOpenChange(false);
      form.reset();
      setSelectedChannels([]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit report",
      });
    },
  });

  const reasons = [
    {
      value: "Incorrect video topic",
      label: t("component.reportDialog.reasons.4"),
      allowedTypes: ["stream", "placeholder"],
      orgRequired: false,
    },
    {
      value: "Incorrect channel mentions",
      label: t("component.reportDialog.reasons.5"),
      allowedTypes: null,
      orgRequired: false,
    },
    {
      value: `This video does not belong to the org [${currentOrg}]`,
      label: t("component.reportDialog.reasons.6", {
        type: video.type,
        org: currentOrg,
      }),
      allowedTypes: null,
      orgRequired: true,
    },
    {
      value: "Low Quality/Misleading Content",
      label: t("component.reportDialog.reasons.1"),
      allowedTypes: ["clip"],
      orgRequired: false,
    },
    {
      value: "Violates the org's derivative work guidelines or inappropriate",
      label: t("component.reportDialog.reasons.2"),
      allowedTypes: ["clip"],
      orgRequired: false,
    },
    {
      value: "Other",
      label: t("component.reportDialog.reasons.3"),
      allowedTypes: null,
      orgRequired: false,
    },
  ].filter((reason) => {
    if (
      reason.orgRequired &&
      (!currentOrg ||
        currentOrg === "All Vtubers" ||
        currentOrg === video.channel.org)
    ) {
      return false;
    }
    if (reason.allowedTypes && !reason.allowedTypes.includes(video.type)) {
      return false;
    }
    return true;
  });

  const onSubmit = (data: FormValues) => {
    const fields = [
      {
        name: "Reason",
        value: data.reasons.join("\n"),
      },
      {
        name: "Comments",
        value: data.comments,
      },
    ];

    if (data.reasons.includes("Incorrect video topic")) {
      fields.push(
        {
          name: "Original Topic",
          value: video.topic_id ? `\`${video.topic_id}\`` : "None",
        },
        {
          name: "Suggested Topic",
          value: data.suggestedTopic ? `\`${data.suggestedTopic}\`` : "None",
        },
      );
    }

    if (data.reasons.includes("Incorrect channel mentions")) {
      fields.push({
        name: "Suggested Mentions",
        value:
          selectedChannels.length > 0
            ? selectedChannels.map((channel) => `\`${channel.id}\``).join("\n")
            : "None",
      });
    }

    submitReport({ fields });
  };

  const handleChannelSelect = (channel: SearchAutoCompleteChannel) => {
    if (!selectedChannels.find((c) => c.id === channel.id)) {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleChannelRemove = (channelId: string) => {
    setSelectedChannels(selectedChannels.filter((c) => c.id !== channelId));
  };

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-w-[500px]">
        <CredenzaClose>
          <div className="i-lucide:x h-4 w-4"></div>
        </CredenzaClose>
        <CredenzaHeader>
          <CredenzaTitle className="text-lg ">
            {t("component.reportDialog.title")}
          </CredenzaTitle>
        </CredenzaHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CredenzaBody>
              {video.channel.id === "UCF4-I8ZQL6Aa-iHfdz-B9KQ" && (
                <Alert className="mb-4">
                  <AlertDescription>
                    <span className="font-bold text-red-500">
                      Note: Please don't report just because you disagree /
                      dislike this subber.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-4">
                <div className="font-medium">{video.title}</div>
                <div className="text-base-11">{video.channel.name}</div>
              </div>

              <FormField
                control={form.control}
                name="reasons"
                render={() => (
                  <FormItem>
                    <div className="space-y-2">
                      {reasons.map((reason) => (
                        <FormField
                          key={reason.value}
                          control={form.control}
                          name="reasons"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(reason.value)}
                                  onCheckedChange={(checked) => {
                                    const value = field.value || [];
                                    checked
                                      ? field.onChange([...value, reason.value])
                                      : field.onChange(
                                          value.filter(
                                            (item) => item !== reason.value,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {reason.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("reasons").includes("Incorrect video topic") && (
                <FormField
                  control={form.control}
                  name="suggestedTopic"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>
                        Current Topic: {video.topic_id || "None"}
                      </FormLabel>
                      <FormControl>
                        <TopicPicker
                          value={field.value}
                          onSelect={(topicId) => field.onChange(topicId)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("reasons").includes("Incorrect channel mentions") && (
                <FormField
                  control={form.control}
                  name="mentionedChannels"
                  render={() => (
                    <FormItem className="mt-4">
                      <FormLabel>Suggested Channel Mentions</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <ChannelPicker
                            form={form}
                            name="mentionedChannels"
                            value={undefined}
                            onSelect={handleChannelSelect}
                          />
                          <div className="flex flex-wrap gap-2">
                            {selectedChannels.map((channel) => (
                              <div
                                key={channel.id}
                                className="flex items-center gap-2 rounded-md bg-base-3 px-2 py-1"
                              >
                                <span>{channel.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4"
                                  onClick={() =>
                                    handleChannelRemove(channel.id)
                                  }
                                >
                                  <div className="i-lucide:x h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>
                      {t("component.reportDialog.comments")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CredenzaBody>

            <CredenzaFooter className=" mt-2">
              <Button
                variant="base-outline"
                onClick={() => onOpenChange(false)}
              >
                {t("views.app.close_btn")}
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {t("views.multiview.confirmOverwriteYes")}
              </Button>
            </CredenzaFooter>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
}

export default ReportDialogMenu;
