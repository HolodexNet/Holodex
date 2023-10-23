import { useReportMutation } from "@/services/reports.service";
import { Button } from "@/shadcn/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function AboutFaqEmailForm() {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });
  const { mutate } = useReportMutation({ type: "contact" });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((payload) =>
          mutate(
            Object.entries(payload).map(([name, value]) => ({ name, value })),
          ),
        )}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("about.contactForm.name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("about.contactForm.email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Type here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("about.contactForm.message")}</FormLabel>
              <FormControl>
                <Textarea placeholder="..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary" className="mt-4">
          {t("about.contactForm.sendButton")}
        </Button>
      </form>
    </Form>
  );
}
