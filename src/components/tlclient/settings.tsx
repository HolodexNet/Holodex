import { Link } from "react-router"

import { SimpleSelect } from "@/components/common/simple-select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useT } from "@/lib/i18n"
import { defaultChatTag } from "@/lib/tlclient/lines"
import { useAuth } from "@/stores/auth"
import { useTlClient } from "@/stores/tlclient"
import { useTldex } from "@/stores/tldex"
import { postableLangOptions } from "./helpers"

export function TlSettingsDialog({
  open,
  onOpenChange,
  lang,
  onLangChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang: string
  onLangChange: (lang: string) => void
}) {
  const { t } = useT()
  const user = useAuth((s) => s.user)
  const chatTag = useTlClient((s) => s.chatTag)
  const stampOnType = useTlClient((s) => s.stampOnType)
  const tabCycles = useTlClient((s) => s.tabCyclesSpeakers)
  const set = useTlClient((s) => s.set)
  const fontSize = useTldex((s) => s.fontSize)
  const showLocalTime = useTldex((s) => s.showLocalTime)
  const setTldex = useTldex((s) => s.set)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("tlClient.header.settings")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {t("tlClient.settings.postingAs")}
            </span>
            {user ? (
              <span className="truncate font-medium">{user.username}</span>
            ) : (
              <Link
                to="/login"
                className="font-medium text-complement hover:underline"
              >
                {t("component.mainNav.login")}
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tlc-lang">{t("tlClient.setup.language")}</Label>
            <SimpleSelect
              id="tlc-lang"
              value={lang}
              onChange={onLangChange}
              options={postableLangOptions()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tlc-tag">{t("tlClient.settings.chatTag")}</Label>
            <Input
              id="tlc-tag"
              value={chatTag ?? ""}
              placeholder={defaultChatTag(lang)}
              onChange={(event) =>
                set(
                  "chatTag",
                  event.target.value === "" ? null : event.target.value
                )
              }
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {t("tlClient.settings.chatTagHint")}
            </p>
          </div>
          <SettingSwitch
            id="tlc-stamp"
            label={t("tlClient.settings.stampOnType")}
            hint={t("tlClient.settings.stampOnTypeHint")}
            checked={stampOnType}
            onChange={(checked) => set("stampOnType", checked)}
          />
          <SettingSwitch
            id="tlc-tab"
            label={t("tlClient.settings.tabCycles")}
            hint={t("tlClient.settings.tabCyclesHint")}
            checked={tabCycles}
            onChange={(checked) => set("tabCyclesSpeakers", checked)}
          />
          <SettingSwitch
            id="tlc-clock"
            label={t("tlClient.settings.localTime")}
            checked={showLocalTime}
            onChange={(checked) => setTldex("showLocalTime", checked)}
          />
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="tlc-font">{t("tlClient.settings.fontSize")}</Label>
            <Input
              id="tlc-font"
              type="number"
              min={10}
              max={32}
              value={fontSize}
              onChange={(event) =>
                setTldex("fontSize", Number(event.target.value) || 14)
              }
              className="w-24"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SettingSwitch({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
