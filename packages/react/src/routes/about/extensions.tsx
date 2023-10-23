import { AboutHeading } from "@/components/about/Heading";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function AboutExtensions() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <AboutHeading>
        <img
          src="/img/holodex-plus/holodex-plus-icon.png"
          className="mr-2 inline h-8 w-8"
        />
        {t("views.extension.title")}
      </AboutHeading>
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <img src="/img/holodex-plus/holodex-plus-screenshot.webp" />
        <div className="flex flex-col gap-4">
          <h5 className="text-xl font-bold">{t("views.extension.features")}</h5>
          <ul className="list-inside list-disc leading-8 tracking-wide">
            <li>{t("views.extension.featureset.one")}</li>
            <li>{t("views.extension.featureset.two")}</li>
            <li>{t("views.extension.featureset.three")}</li>
            <li>{t("views.extension.featureset.four")}</li>
          </ul>
          <div className="flex min-h-fit flex-wrap items-center justify-center gap-4">
            <Link
              to="https://chrome.google.com/webstore/detail/holodex-plus/mjcecbpccklceljomllkhilglcdcncbh"
              title="Chrome Webstore"
            >
              <img
                src="/img/holodex-plus/chrome-webstore.png"
                className="h-12 w-auto rounded-lg"
              />
            </Link>
            <Link
              to="https://addons.mozilla.org/firefox/addon/holodex-plus/"
              title="Firefox Extension"
            >
              <img
                src="/img/holodex-plus/firefox-amo.png"
                className="h-12 w-auto rounded-lg"
              />
            </Link>
            <Button asChild size="lg">
              <Link
                to="https://github.com/HolodexNet/Holodex-Plus"
                target="_blank"
              >
                <div className="i-lucide:github" />
                Install from GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <AboutHeading>
        <img
          src="https://imgproxy.raycast.com/RNu0jpnAtWUnMiJAdLuIvB7-gpQ5ohNPGiR3td1FigI/rs:fill:64:64/dpr:2/aHR0cHM6Ly9maWxl/cy5yYXljYXN0LmNv/bS9vb2NlNzNybGFi/a2Z5M3QwZm5weWQ1/ZnVodzZz"
          className="mr-2 inline h-8 w-8"
        />
        Raycast Extension (macOS)
      </AboutHeading>
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <img
          src="https://files.raycast.com/ynzdcq6vupr1rptcwz2qd3j323f1"
          className="w-full"
        />
        <div className="flex flex-col gap-4">
          <h5 className="text-xl font-bold">{t("views.extension.features")}</h5>
          <ul className="list-inside list-disc leading-8 tracking-wide">
            <li>{t("views.extension.raycast.features.0")}</li>
            <li>{t("views.extension.raycast.features.1")}</li>
            <li>{t("views.extension.raycast.features.2")}</li>
            <li>{t("views.extension.raycast.features.3")}</li>
          </ul>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="https://www.raycast.com/uetchy/holodex" target="_blank">
                <img
                  src="https://raycastapp.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F9dab15c5-70d8-4f0d-a8b1-604b0b85912b%2Fraycast-logo-256.png?table=block&id=ce1ccf83-06b1-4ac8-b8d4-7b3276bf34e0&spaceId=50d13040-8e7c-4990-aed4-0844f62c7aa2&width=250&userId=&cache=v2"
                  className="h-6 w-6"
                />
                Get it on Raycast Store
              </Link>
            </Button>
            <Button size="lg" asChild>
              <Link
                to="https://github.com/HolodexNet/raycast-holodex"
                target="_blank"
              >
                <div className="i-lucide:github" />
                Install from GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
