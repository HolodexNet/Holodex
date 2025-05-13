import { ContactList } from "@/components/about/ContactList";
import { AboutDescription } from "@/components/about/Description";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shadcn/ui/accordion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function FaqQuestion({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-semibold tracking-tight">{children}</h3>;
}

export function AboutFaq() {
  const { t } = useTranslation();

  return (
    <div>
      <Accordion type="multiple">
        <AccordionItem value="youtube">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.ytchatHeader")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription className="mb-2">
              {t("about.faq.ytchatContent")}
            </AboutDescription>
            <Link
              className="text-secondary-11 hover:underline"
              to="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection?redirectslug=disable-third-party-cookies"
              target="_blank"
            >
              {t("about.faq.ytchatFirefox")}
            </Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="autoplay">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.autoplayHeader")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.autoplayContent")}
            </AboutDescription>
            <h4 className="py-2 text-xl font-bold">Safari:</h4>
            <img src="https://www.imore.com/sites/imore.com/files/styles/large/public/field/image/2017/07/safari-custom-settings-websites-mac-screenshot-06.jpg?itok=ONVYTcno" />
            <h4 className="py-2 text-xl font-bold">Firefox:</h4>
            <img src="https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/firefox/files/2019/04/Screen-Shot-2019-04-01-at-11.21.21-AM.png" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="mobile">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.mobile.title")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.mobile.content.summary")}
            </AboutDescription>
            <ul className="mt-2 list-inside list-disc">
              <li>
                {t("about.faq.mobile.content.android.0")}
                <span className="i-heroicons:ellipsis-vertical" />
                {t("about.faq.mobile.content.android.1")}
              </li>
              <li>
                {t("about.faq.mobile.content.ios.0")}
                <span className="i-heroicons:arrow-up-on-square inline-block" />
                {t("about.faq.mobile.content.ios.1")}
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="favorite-disappear">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.favorite.disappear.title")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.favorite.contents.0")}
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subber">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.subber.title")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.subber.contents.0")}
              <Link
                to="/about/request"
                className="text-secondary-11 hover:underline"
              >
                {t("about.faq.subber.contents.1")}
              </Link>
              {t("about.faq.subber.contents.2")}
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="video">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.videoLinkage")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.videoLinkageContent")}
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="quit">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.quitHolodex")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.quitHolodexContent")}
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="feedback">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.feedback.title")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.faq.feedback.contents.0")}
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>
            <FaqQuestion>{t("about.faq.support.title")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription
              className="mb-2"
              dangerouslySetInnerHTML={{
                // this sentence has raw html tag, load via dangerouslySetInnerHTML
                __html: t("about.faq.support.contents.0"),
              }}
            />
            <div className="flex flex-wrap gap-2 p-2">
              <a
                href="https://ko-fi.com/holodex"
                target="_blank"
                rel="noopener noreferrer"
                className={`
              flex grow basis-1 items-center gap-2 rounded-lg border-2 border-red-10
              px-4 py-2 text-red-10 transition-all
              duration-300 ease-in-out
              focus:outline-hidden focus:ring-2 focus:ring-gray-8 focus:ring-offset-2
            `}
              >
                <span className="i-cib:ko-fi"></span>
                <span>Ko-fi: Support Holodex</span>
              </a>
              <a
                href="https://patreon.com/holodex"
                target="_blank"
                rel="noopener noreferrer"
                className={`
              flex grow basis-1 items-center gap-2 rounded-lg border-2 border-red-10
              px-4 py-2 text-red-10 transition-all
              duration-300 ease-in-out
              focus:outline-hidden focus:ring-2 focus:ring-gray-8 focus:ring-offset-2
            `}
              >
                <span className="i-cib:patreon"></span>
                <span>Patreon: Support Holodex</span>
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="gdpr">
          <AccordionTrigger>
            <FaqQuestion>{t("about.gdpr")}</FaqQuestion>
          </AccordionTrigger>
          <AccordionContent>
            <AboutDescription>
              {t("about.gdprContent")}
              <b>{t("about.gdprDeletion")}</b>
            </AboutDescription>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="h-12"></div>
      <ContactList />
    </div>
  );
}
