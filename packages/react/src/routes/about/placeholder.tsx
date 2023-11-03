import { ChannelPicker } from "@/components/about/request/ChannelPicker";
import { DatePicker } from "@/components/common/DatePicker";
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
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { userAtom } from "@/store/auth";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Button } from "@/shadcn/ui/button";
import { usePlaceholderMutation, useVideo } from "@/services/video.service";
import { useToast } from "@/shadcn/ui/use-toast";
import { Label } from "@/shadcn/ui/label";
import { cn } from "@/lib/utils";
import { AboutHeading } from "@/components/about/Heading";

const timezones = [
  {
    text: "GMT (+0)",
    value: "Etc/GMT",
  },
  {
    text: "JST (+9)",
    value: "Asia/Tokyo",
  },
  {
    text: "PST/PDT (-8/-7)",
    value: "America/Los_Angeles",
  },
  {
    text: "EST/EDT (-5/-4)",
    value: "America/New_York",
  },
];

export default function AboutPlaceholder() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const [id, setId] = useState("");
  const [type, setType] = useState("new");
  const [timezone, setTimezone] = useState("Asia/Tokyo");
  const form = useForm<PlaceholderRequestBody>({
    defaultValues: {
      id: "",
      channel_id: "",
      duration: 60,
      liveTime: dayjs.tz(new Date(), "UTC").startOf("day").toISOString(),
      title: {
        credits: {
          editor: {
            user: user?.id,
            name: user?.username,
          },
        },
      },
    },
  });

  const { data } = useVideo<PlaceholderVideo>(
    { id },
    {
      enabled: type === "existing" && !!id,
    },
  );

  const { mutate } = usePlaceholderMutation();

  const onSubmit: SubmitHandler<PlaceholderRequestBody> = ({
    duration,
    ...body
  }) => {
    mutate(
      { duration: duration * 60, ...body },
      {
        onSuccess: () => {
          toast({
            title: t("component.addPlaceholder.success"),
          });
        },
        onError: (error) => {
          console.error(error);
          toast({
            title: t("component.addPlaceholder.error"),
            description: error.message,
            variant: "error",
          });
        },
      },
    );
  };

  const onInvalid = () => {
    toast({
      title: t("component.addPlaceholder.error"),
      variant: "error",
    });
  };

  const typeCN = (typeId: string) =>
    cn(
      "border-blue-6 hover:bg-blue-3 flex w-full cursor-pointer items-center justify-center rounded-md border-2 py-2 text-lg transition-all active:scale-[97%] select-none",
      {
        "bg-blue-7  border-blue-8 hover:bg-blue-6": type === typeId,
      },
    );

  useEffect(() => {
    if (type === "existing" && id && data) {
      form.setValue("channel_id", data.channel.id ?? "");
      form.setValue("liveTime", data.start_scheduled ?? "");
      form.setValue("duration", data.duration / 60 ?? 60);
      form.setValue("title.link", data.link ?? "");
      form.setValue("title.name", data.title ?? "");
      form.setValue("title.jp_name", data.jp_name ?? "");
      form.setValue("title.thumbnail", data.thumbnail ?? "");
      form.setValue("title.placeholderType", data.placeholderType ?? "");
      form.setValue("title.certainty", data.certainty ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <AboutHeading>{t("about.placeholder.title")}</AboutHeading>
      <div className="flex gap-2">
        <RadioGroup
          className="flex w-full gap-2"
          value={type}
          onValueChange={setType}
        >
          <RadioGroupItem value="new" id="new" className="sr-only" />
          <Label className={typeCN("new")} htmlFor="new">
            {t("component.addPlaceholder.type.new")}
          </Label>
          <RadioGroupItem value="existing" id="existing" className="sr-only" />
          <Label className={typeCN("existing")} htmlFor="existing">
            {t("component.addPlaceholder.type.existing")}
          </Label>
        </RadioGroup>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="title.credits.editor.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("component.addPlaceholder.creditName")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={user?.username}
                    {...field}
                    {...form.register("title.credits.editor.name", {
                      required: {
                        value: true,
                        message: t("channelRequest.required"),
                      },
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === "existing" && (
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("component.addPlaceholder.idLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...form.register("id", {
                        required: {
                          value: true,
                          message: t("channelRequest.required"),
                        },
                        minLength: {
                          value: 11,
                          message: t("component.addPlaceholder.idHint"),
                        },
                        maxLength: {
                          value: 11,
                          message: t("component.addPlaceholder.idHint"),
                        },
                        onChange: (e) => setId(e.target.value),
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="channel_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {t("component.addPlaceholder.channelLabel")}
                </FormLabel>
                <ChannelPicker
                  name="channel_id"
                  form={form}
                  field={field}
                  onSelect={({ id }) => {
                    form.setValue("channel_id", id);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("component.addPlaceholder.titleLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    {...form.register("title.name", {
                      required: {
                        value: true,
                        message: t("channelRequest.required"),
                      },
                    })}
                  />
                </FormControl>
                <FormDescription>
                  {t("component.addPlaceholder.titleHint")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title.jp_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("component.addPlaceholder.jpTitleLabel")}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  {t("component.addPlaceholder.jpTitleHint")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title.link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("component.addPlaceholder.linkLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://twitter.com/..."
                    {...field}
                    {...form.register("title.link", {
                      required: {
                        value: true,
                        message: t("channelRequest.required"),
                      },
                    })}
                  />
                </FormControl>
                <FormDescription>
                  {t("component.addPlaceholder.linkHint")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title.thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("component.addPlaceholder.thumbnailLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://imgur.com/..."
                    {...field}
                    {...form.register("title.thumbnail", {
                      required: {
                        value: true,
                        message: t("channelRequest.required"),
                      },
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="title.placeholderType"
              render={({ field }) => (
                <FormItem
                  {...form.register("title.placeholderType", {
                    required: {
                      value: true,
                      message: t("channelRequest.required"),
                    },
                  })}
                >
                  <FormLabel>
                    {t("component.addPlaceholder.eventType.label")}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <PlaceholderRadioItem
                        value="scheduled-yt-stream"
                        label={t(
                          "component.addPlaceholder.eventType.scheduledYTStream",
                        )}
                      />
                      <PlaceholderRadioItem
                        value="external-stream"
                        label={t(
                          "component.addPlaceholder.eventType.externalStream",
                        )}
                      />
                      <PlaceholderRadioItem
                        value="event"
                        label={t("component.addPlaceholder.eventType.event")}
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title.certainty"
              render={({ field }) => (
                <FormItem
                  {...form.register("title.certainty", {
                    required: {
                      value: true,
                      message: t("channelRequest.required"),
                    },
                  })}
                >
                  <FormLabel>
                    {t("component.addPlaceholder.certainty.label")}
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <PlaceholderRadioItem
                        value="certain"
                        label={t("component.addPlaceholder.certainty.certain")}
                      />
                      <PlaceholderRadioItem
                        value="likely"
                        label={t("component.addPlaceholder.certainty.likely")}
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="liveTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("component.addPlaceholder.dateLabel")}</FormLabel>
                <FormControl>
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormItem>
                      <Select
                        defaultValue={timezone}
                        onValueChange={setTimezone}
                      >
                        <SelectTrigger className="min-w-[120px] whitespace-nowrap">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {timezones.map(({ text, value }) => (
                              <SelectItem key={value} value={value}>
                                {text}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                    <FormItem
                      className="w-full"
                      {...form.register("liveTime", {
                        required: {
                          value: true,
                          message: t("channelRequest.required"),
                        },
                      })}
                    >
                      <DatePicker
                        selected={
                          field.value
                            ? dayjs.tz(field.value, "UTC").toDate()
                            : undefined
                        }
                        timezone={timezone}
                        onSelect={(date) => field.onChange(date.toISOString())}
                      />
                    </FormItem>
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("component.addPlaceholder.durationLabel")}
                </FormLabel>
                <FormControl>
                  <FormItem className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      {...form.register("duration", {
                        required: {
                          value: true,
                          message: t("channelRequest.required"),
                        },
                      })}
                    />
                    <span className="shrink-0 whitespace-nowrap">
                      {t("component.addPlaceholder.duration.minutes")}
                    </span>
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size="lg" className="w-full">
            {type === "new"
              ? t("component.addPlaceholder.createNew")
              : t("component.addPlaceholder.modifyExisting")}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function PlaceholderRadioItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <FormItem className="flex items-center gap-2 space-y-0">
      <FormControl>
        <RadioGroupItem className="h-5 w-5" value={value} />
      </FormControl>
      <FormLabel className="line-clamp-1 text-lg">{label}</FormLabel>
    </FormItem>
  );
}
