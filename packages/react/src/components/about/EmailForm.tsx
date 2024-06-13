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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email is invalid" }),
  message: z
    .string()
    .min(1, { message: "Message is required" })
    .min(20, {
      message: "Message must be at least 20 characters",
    })
    .max(500, { message: "Message must be less than 500 characters" }),
});

export function AboutFaqEmailForm() {
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
        className="grid gap-2 md:gap-4"
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("about.contactForm.name")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Type here" {...field} />
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
                <Textarea placeholder="..." {...field} className="min-h-32" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="ghost" className="" size="lg">
          <div className="i-heroicons:envelope"></div>
          {t("about.contactForm.sendButton")}
        </Button>
      </form>
    </Form>
  );
}
