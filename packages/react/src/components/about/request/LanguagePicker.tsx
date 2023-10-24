import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

const languages = [
  {
    text: "English",
    value: "en",
  },
  {
    text: "日本語",
    value: "ja",
  },
  {
    text: "中文",
    value: "zh",
  },
  {
    text: "한국어",
    value: "ko",
  },
  {
    text: "Español",
    value: "es",
  },
  {
    text: "Français",
    value: "fr",
  },
  {
    text: "ไทย (Thai)",
    value: "th",
  },
  {
    text: "Bahasa Indonesia / Melayu",
    value: "id",
  },
  {
    text: "Русский язык",
    value: "ru",
  },
];

interface LanguagePickerProps<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
> {
  name: FieldPath<T>;
  form: UseFormReturn<T>;
  field: ControllerRenderProps<T, FieldName>;
}

export function LanguagePicker<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
>({ name, form, field }: LanguagePickerProps<T, FieldName>) {
  const { t } = useTranslation();

  return (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
      {...form.register(name, {
        required: {
          value: true,
          message: t("channelRequest.required"),
        },
      })}
    >
      <SelectTrigger>
        <SelectValue placeholder={t("channelRequest.selectLanguage")} />
      </SelectTrigger>
      <SelectContent>
        {languages.map(({ text, value }) => (
          <SelectItem key={value} value={value}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
