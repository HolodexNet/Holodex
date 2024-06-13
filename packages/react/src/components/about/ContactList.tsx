import { AboutFaqEmailForm } from "@/components/about/EmailForm";
import { AboutHeading } from "@/components/about/Heading";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function ContactList() {
  const { t } = useTranslation();

  return (
    <div>
      <AboutHeading>Get in touch</AboutHeading>
      <p className="my-2 max-w-[700px] text-gray-500 dark:text-gray-400">
        Have a question or want to work together? We'd love to hear from you.
      </p>
      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
        <Button asChild variant="default" className="p-8">
          <a
            href="https://twitter.com/messages/compose?recipient_id=1320894663084048384&text=Hello"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="i-logos:twitter" />
            {t("about.contact.twitter")}
          </a>
        </Button>
        <Button asChild variant="default" className="p-8">
          <a
            href="https://twitter.com/messages/compose?recipient_id=1320894663084048384&text=Hello"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="i-logos:discord-icon" />
            {t("about.contact.discord")}
          </a>
        </Button>
      </div>
      <div className="h-4"></div>
      {/* <AboutHeading>{t("about.contact.discord")}</AboutHeading>
      <Link to="https://discord.gg/A24AbzgvRJ" target="_blank">
        <img
          src="https://discordapp.com/api/guilds/796190073271353385/widget.png?style=banner2"
          width="280"
          className="rounded"
        />
      </Link>
      <AboutHeading>{t("about.contact.twitter")}</AboutHeading>
      <div className="flex gap-2">
        <Link
          to="https://twitter.com/intent/follow?original_referer=https://holodex.net%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Eholodex&screen_name=holodex"
          target="_blank"
        >
          <img
            alt="Twitter Follow"
            src="https://img.shields.io/twitter/follow/holodex?color=%231d9bf0&logoColor=%231d9bf0"
          />
        </Link>
        <Link
          to="https://twitter.com/messages/compose?recipient_id=1320894663084048384&text=Hello"
          target="_blank"
        >
          <img
            alt="Twitter Message"
            src="https://img.shields.io/twitter/url?label=Message%20%40Holodex&style=social&url=https%3A%2F%2Fholodex.net"
          />
        </Link>
      </div> */}
      <AboutHeading>{t("about.contact.email")}</AboutHeading>
      <AboutFaqEmailForm />
    </div>
  );
}
