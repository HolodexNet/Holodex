import { useUserRefreshMutation } from "@/services/user.service";
import { Button } from "@/shadcn/ui/button";
import { userAtom } from "@/store/auth";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

export function SettingsResetKeyButton() {
  const { t } = useTranslation();
  const { mutate } = useUserRefreshMutation();
  const user = useAtomValue(userAtom);

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

  return (
    <Button variant="destructive" onClick={resetKey}>
      {t("views.login.apikeyNew")}
    </Button>
  );
}
