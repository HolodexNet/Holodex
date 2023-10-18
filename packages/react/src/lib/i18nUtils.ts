import { SupportedLangCodes } from "./i18n";

export async function loadDayJsLocale(langCode: SupportedLangCodes) {
  switch (langCode) {
    case "en":
    case "lol-UWU":
    case "lol-PEKO":
      return await import("dayjs/locale/en");

    case "en-GB":
      return await import("dayjs/locale/en-gb");

    case "en-CA":
      return await import("dayjs/locale/en-ca");

    case "ja-JP":
      return await import("dayjs/locale/ja");

    case "zh-TW":
      return await import("dayjs/locale/zh-tw");

    case "zh-CN":
      return await import("dayjs/locale/zh-cn");

    case "es-ES":
      return await import("dayjs/locale/es");

    case "ms-MY":
      return await import("dayjs/locale/ms");

    case "id-ID":
      return await import("dayjs/locale/id");

    case "ru-RU":
      return await import("dayjs/locale/ru");

    case "fr-FR":
      return await import("dayjs/locale/fr");

    case "pt-BR":
      return await import("dayjs/locale/pt-br");

    case "de-DE":
      return await import("dayjs/locale/de");

    case "it-IT":
      return await import("dayjs/locale/it");

    case "ko-KR":
      return await import("dayjs/locale/ko");

    case "tr-TR":
      return await import("dayjs/locale/tr");

    case "vi-VN":
      return await import("dayjs/locale/vi");

    case "hu-HU":
      return await import("dayjs/locale/hu");

    case "th-TH":
      return await import("dayjs/locale/th");

    default:
      throw new Error(`Unsupported language code: ${langCode}`);
  }
}
