import { QuickLink } from "@/components/about/QuickLink";
import { LoginButtons } from "@/components/login/LoginButtons";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { useAuth } from "@/hooks/useAuth";
import { useUserRefreshMutation } from "@/services/user.service";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shadcn/ui/tooltip";
import { useToast } from "@/shadcn/ui/use-toast";
import { userAtom } from "@/store/auth";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCopyToClipboard } from "usehooks-ts";

export default function SettingsUser() {
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();
  const user = useAtomValue(userAtom);
  const { logout } = useAuth();
  const { i18n, t } = useTranslation();
  const { mutate } = useUserRefreshMutation();

  function resetKey() {
    // /* eslint-disable no-restricted-globals, no-alert */
    if (user?.api_key) {
      const confirm1 = confirm(t("views.login.apikeyResetConfirm1"));
      if (!confirm1) {
        alert(t("views.login.apikeyResetNvm"));
        return;
      }
      const confirm2 = confirm(t("views.login.apikeyResetConfirm2"));
      if (!confirm2) {
        alert(t("views.login.apikeyResetNvm"));
        return;
      }
    }
    mutate(undefined, {
      onError: () => {
        alert("something went wrong creating your key...");
      },
    });
    // /* eslint-enable no-restricted-globals, no-alert */
  }

  if (!user)
    return (
      <div className="mx-auto max-w-xl">
        <LoginButtons />
      </div>
    );

  return (
    <div className="flex flex-col p-2 md:p-4">
      <div className="flex items-center gap-6">
        <img
          className="h-24 w-24 rounded-full"
          src={`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`}
        />
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold md:text-4xl">{user.username}</div>
          <div className="text-base-11 capitalize">
            {user.role} : {user.contribution_count}
            {t("component.mainNav.points")}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    className={
                      user.discord_id
                        ? "border-secondary-8 text-secondary-11"
                        : "border-base text-base-11"
                    }
                    variant="outline"
                  >
                    <div className="i-carbon:logo-discord md:mr-1" />
                    <span className="hidden md:block">Discord</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {user?.discord_id ?? t("views.settings.userNotLinked")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    className={
                      user.google_id
                        ? "border-secondary-8 text-secondary-11"
                        : "border-base text-base-11"
                    }
                    variant="outline"
                  >
                    <div className="i-mdi:google md:mr-1" />
                    <span className="hidden md:block">Google</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {user.google_id ?? t("views.settings.userNotLinked")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    className={
                      user.twitter_id
                        ? "border-secondary-6 text-secondary-11"
                        : "border-base text-base-11"
                    }
                    variant="outline"
                  >
                    <div className="i-mdi:twitter md:mr-1" />
                    <span className="hidden md:block">Twitter</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {user.twitter_id ?? t("views.settings.userNotLinked")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="ml-auto hidden flex-col gap-2 xl:flex">
          {user?.role !== "user" && (
            <Button variant="outline" asChild>
              <Link
                to={
                  /(en|lol)/.test(i18n.language)
                    ? "https://github.com/HolodexNet/Holodex/wiki/Editor's-Guide-to-Holodex"
                    : `https://github-com.translate.goog/HolodexNet/Holodex/wiki/Editor's-Guide-to-Holodex?_x_tr_sl=en&_x_tr_tl=${i18n.language}&_x_tr_hl=en&_x_tr_pto=wapp`
                }
                target="_blank"
              >
                <div className="i-heroicons:information-circle" />
                Editor Guide
              </Link>
            </Button>
          )}
          <Button
            className="border-red text-red"
            variant="outline"
            onClick={logout}
          >
            <div className="i-heroicons:arrow-right-on-rectangle" />
            {t("component.mainNav.logout")}
          </Button>
        </div>
      </div>
      <SettingsItem label={t("views.login.linkAcc")}>
        <LoginButtons />
      </SettingsItem>
      <SettingsItem label={t("views.login.username")}>
        <div className="ml-auto flex w-full max-w-md items-center gap-2">
          <Input placeholder={user.username} />
          <Button className="whitespace-nowrap">
            {t("views.watch.uploadPanel.usernameChange")}
          </Button>
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.login.ownedYtChannel")}>
        <div className="ml-auto flex max-w-md flex-col gap-2">
          <Input className="ml-auto max-w-md" value="None on file" disabled />
          <span className="text-base-11 text-xs">
            {t("views.login.futureYtcOwnerMessage")}
          </span>
        </div>
      </SettingsItem>
      <SettingsItem label="API Key">
        <div className="ml-auto flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input value={user.api_key} readOnly />
            <Button
              size="icon-lg"
              variant="ghost"
              onClick={() => {
                copy(user.api_key);
                toast({ title: t("component.toast.copiedToClipboard") });
              }}
            >
              <div className="i-heroicons:square-2-stack" />
            </Button>
          </div>
          <Button onClick={resetKey}>{t("views.login.apikeyNew")}</Button>
          <QuickLink
            label={t("about.quicklink.apiDocs")}
            href="https://docs.holodex.net"
            icon="i-heroicons:file-code"
          />
        </div>
      </SettingsItem>
    </div>
  );
}
