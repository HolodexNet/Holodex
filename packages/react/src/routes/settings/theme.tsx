import { SettingsItem } from "@/components/settings/SettingsItem";
import { darkAtom } from "@/hooks/useTheme";
import { Switch } from "@/shadcn/ui/switch";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

export default function SettingsTheme() {
  const { t } = useTranslation();
  const [dark, setDark] = useAtom(darkAtom);

  return (
    <div className="flex flex-col p-2 md:p-4">
      <SettingsItem label={t("views.settings.darkModeLabel")}>
        <Switch checked={dark} onCheckedChange={setDark} />
      </SettingsItem>
    </div>
  );
}
