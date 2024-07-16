import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { useSearchParams } from "react-router-dom";
import { userAtom } from "@/store/auth";
import { localeAtom } from "@/store/i18n";
import { useVideo } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import { AboutHeading } from "@/components/about/Heading";
import {
  FormRadioGroup,
  FormChannelPicker,
  FormDatePicker,
  FormInput,
} from "@/components/about/placeholder/FormFields";
import {
  PlaceholderFormData,
  placeholderSchema,
} from "@/components/about/placeholder/schema";
import { usePlaceholderSubmit } from "@/components/about/placeholder/usePlaceholderSubmit";
import { Form } from "@/shadcn/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import { Label } from "@/shadcn/ui/label";
import { cn } from "@/lib/utils";

export function AboutPlaceholder() {
  const { t } = useTranslation();
  const { dayjs } = useAtomValue(localeAtom);
  const user = useAtomValue(userAtom);
  const [searchParams] = useSearchParams();
  const [type, setType] = useState("new");
  const typeCN = (typeId: string) =>
    cn(
      "flex w-full cursor-pointer select-none items-center justify-center rounded-md border-2 border-blue-6 py-2 text-lg transition-all hover:bg-blue-3 active:scale-[97%]",
      {
        "bg-blue-7 border-blue-8 hover:bg-blue-6": type === typeId,
      },
    );

  const [id, setId] = useState("");

  const methods = useForm<PlaceholderFormData>({
    resolver: zodResolver(placeholderSchema),
    defaultValues: {
      id: "",
      channel_id: "",
      duration: 60,
      liveTime: dayjs().tz("UTC").startOf("day").toISOString(),
      title: {
        credits: {
          editor: {
            user: user?.id,
            name: user?.username,
          },
        },
        name: "",
        jp_name: "",
        link: "",
        thumbnail: "",
        placeholderType: "scheduled-yt-stream",
        certainty: "certain",
      },
    },
  });

  const { data: videoData } = useVideo<PlaceholderVideo>(
    { id },
    {
      enabled: type === "existing" && !!id,
    },
  );

  const onSubmit = usePlaceholderSubmit(searchParams.get("token"));

  useEffect(() => {
    if (type === "existing" && id && videoData) {
      methods.reset({
        channel_id: videoData.channel_id,
        liveTime: videoData.start_scheduled,
        duration: videoData.duration / 60,
        title: {
          link: videoData.link,
          name: videoData.title,
          jp_name: videoData.jp_name,
          thumbnail: videoData.thumbnail,
          placeholderType: videoData.placeholderType,
          certainty: videoData.certainty,
          credits: {
            editor: {
              user: user?.id,
              name: user?.username,
            },
          },
        },
      });
    }
  }, [videoData, type, id, user]);

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
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            name="title.credits.editor.name"
            label={t("component.addPlaceholder.creditName")}
            placeholder={user?.username}
          />
          {type === "existing" && (
            <FormInput
              name="id"
              label={t("component.addPlaceholder.idLabel")}
              onChange={(e) => setId(e.target.value)}
            />
          )}
          <FormChannelPicker
            name="channel_id"
            label={t("component.addPlaceholder.channelLabel")}
          />
          <FormInput
            name="title.name"
            label={t("component.addPlaceholder.titleLabel")}
            description={t("component.addPlaceholder.titleHint")}
          />
          <FormInput
            name="title.jp_name"
            label={t("component.addPlaceholder.jpTitleLabel")}
            description={t("component.addPlaceholder.jpTitleHint")}
          />
          <FormInput
            name="title.link"
            label={t("component.addPlaceholder.linkLabel")}
            placeholder="https://twitter.com/..."
            description={t("component.addPlaceholder.linkHint")}
          />
          <FormInput
            name="title.thumbnail"
            label={t("component.addPlaceholder.thumbnailLabel")}
            placeholder="https://imgur.com/..."
          />
          <FormRadioGroup
            name="title.placeholderType"
            label={t("component.addPlaceholder.eventType.label")}
            options={[
              {
                value: "scheduled-yt-stream",
                label: t(
                  "component.addPlaceholder.eventType.scheduledYTStream",
                ),
              },
              {
                value: "external-stream",
                label: t("component.addPlaceholder.eventType.externalStream"),
              },
              {
                value: "event",
                label: t("component.addPlaceholder.eventType.event"),
              },
            ]}
          />
          <FormRadioGroup
            name="title.certainty"
            label={t("component.addPlaceholder.certainty.label")}
            options={[
              {
                value: "certain",
                label: t("component.addPlaceholder.certainty.certain"),
              },
              {
                value: "likely",
                label: t("component.addPlaceholder.certainty.likely"),
              },
            ]}
          />
          <FormDatePicker
            name="liveTime"
            label={t("component.addPlaceholder.dateLabel")}
          />
          <FormInput
            name="duration"
            label={t("component.addPlaceholder.durationLabel")}
            type="number"
            step="1"
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
