import { usePlaceholderMutation } from "@/services/video.service";
import { useToast } from "@/shadcn/ui/use-toast";
import { useTranslation } from "react-i18next";
import { PlaceholderFormData } from "./schema";

export const usePlaceholderSubmit = (token: string | null) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { mutate } = usePlaceholderMutation();

  const onSubmit = (data: PlaceholderFormData) => {
    mutate(
      {
        body: { ...data, duration: data.duration * 60 },
        token,
      },
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

  return onSubmit;
};
