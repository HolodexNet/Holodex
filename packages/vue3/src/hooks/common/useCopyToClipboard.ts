import { useI18n } from "vue-i18n";
import { useToast } from "vue-toast-notification";

export const useClipboardWithToast = () => {
  const { open: toast } = useToast();
  const { t } = useI18n();
  return (text: string, silent?: boolean) => {
    navigator.clipboard.writeText(text);
    if (silent) return;
    toast({
      //   TODO: i18n
      message: "Copied to Clipboard",
      type: "success",
      duration: 1500,
      position: "top-right",
    });
  };
};
