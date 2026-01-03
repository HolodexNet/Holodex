import * as chrono from "chrono-node";
import dayjs from "dayjs";

/**
 * Maps i18n language codes to chrono-node parsers.
 *
 * chrono-node supported locales: en, ja, fr, nl, ru, uk
 * (de, pt, zh.hant are partially supported)
 */
const getChronoParser = (lang: string): chrono.Chrono => {
  // Extract base language from locale code (e.g., "ja-JP" -> "ja")
  const baseLang = lang.split("-")[0];

  switch (baseLang) {
    case "ja":
      return chrono.ja.casual;
    case "fr":
      return chrono.fr.casual;
    case "nl":
      return chrono.nl.casual;
    case "ru":
      return chrono.ru.casual;
    case "uk":
      return chrono.uk.casual;
    case "de":
      return chrono.de.casual;
    case "pt":
      return chrono.pt.casual;
    case "zh":
      return chrono.zh.casual;
    case "en":
    default:
      // For English variants (en, en-GB, en-CA) and unsupported languages,
      // fall back to default casual parser
      return chrono.casual;
  }
};

export interface ParsedDateResult {
  /** The parsed Date object */
  date: Date;
  /** ISO string representation for the value field */
  isoString: string;
  /** Human-readable display text */
  displayText: string;
  /** The original text that was parsed */
  originalText: string;
}

/**
 * Parses a natural language date string using chrono-node with localization support.
 *
 * @param text - The natural language date string to parse (e.g., "yesterday", "2 weeks ago")
 * @param lang - The current i18n language code
 * @param referenceDate - Optional reference date for relative parsing (defaults to now)
 * @returns ParsedDateResult if successful, null if parsing failed
 */
export function parseDateWithLocale(
  text: string,
  lang: string,
  referenceDate?: Date,
): ParsedDateResult | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const parser = getChronoParser(lang);
  const refDate = referenceDate ?? new Date();

  // Use chrono's parse method to get more detailed results
  const results = parser.parse(text, refDate, { forwardDate: false });

  if (results.length === 0) {
    return null;
  }

  // Take the first (most likely) result
  const result = results[0];
  const parsedDate = result.start.date();

  // Format display text using dayjs for consistent formatting
  const displayText = dayjs(parsedDate).format("YYYY-MM-DD HH:mm");

  return {
    date: parsedDate,
    isoString: parsedDate.toISOString(),
    displayText,
    originalText: result.text,
  };
}

/**
 * Attempts multiple parsing strategies to extract a date from user input.
 * First tries localized chrono parsing, then falls back to direct dayjs parsing.
 *
 * @param text - The date string to parse
 * @param lang - The current i18n language code
 * @returns ParsedDateResult if successful, null if all parsing strategies failed
 */
export function parseDate(
  text: string,
  lang: string = "en",
): ParsedDateResult | null {
  // First, try chrono-node for natural language parsing
  const chronoResult = parseDateWithLocale(text, lang);
  if (chronoResult) {
    return chronoResult;
  }

  // Fallback: try direct dayjs parsing for ISO dates and other formats
  const dayjsResult = dayjs(text);
  if (dayjsResult.isValid() && text.length >= 4) {
    // Require at least 4 chars (e.g., "2024")
    const parsedDate = dayjsResult.toDate();
    return {
      date: parsedDate,
      isoString: parsedDate.toISOString(),
      displayText: dayjsResult.format("YYYY-MM-DD HH:mm"),
      originalText: text,
    };
  }

  return null;
}
