import { describe, it, expect } from "vitest";
import { splitSearchClassTerms } from "./helper";
import { JSON_SCHEMA } from "./types";

describe("splitSearchClassTerms", () => {
  // Setup mock language category mapping
  const mockLangCategoryMap = {
    org: "org",
    組織: "org",
    from: "from",
    から: "from",
    to: "to",
    まで: "to",
    search: "search",
    検索: "search",
    description: "description",
    説明: "description",
    type: "type",
    タイプ: "type",
    topic: "topic",
    トピック: "topic",
    vtuber: "vtuber",
    lang: "lang",
    言語: "lang",
    has_song: "has_song",
    歌あり: "has_song",
  } as Record<string, keyof typeof JSON_SCHEMA>;

  it("should correctly split valid category and search term", () => {
    const result = splitSearchClassTerms("org:hololive", mockLangCategoryMap);
    expect(result).toEqual(["org", "hololive"]);
  });

  it("should handle Japanese colons and categories", () => {
    const result = splitSearchClassTerms(
      "組織：ホロライブ",
      mockLangCategoryMap,
    );
    expect(result).toEqual(["org", "ホロライブ"]);
  });

  it("should correctly handle date categories", () => {
    const result = splitSearchClassTerms(
      "from:2024-01-01",
      mockLangCategoryMap,
    );
    expect(result).toEqual(["from", "2024-01-01"]);
  });

  it("should handle Japanese date categories", () => {
    const result = splitSearchClassTerms(
      "から：2024-01-01",
      mockLangCategoryMap,
    );
    expect(result).toEqual(["from", "2024-01-01"]);
  });

  it("should return undefined category for invalid category prefix", () => {
    const result = splitSearchClassTerms("invalid:term", mockLangCategoryMap);
    expect(result).toEqual([undefined, "invalid:term"]);
  });

  it("should handle search terms without category prefix", () => {
    const result = splitSearchClassTerms("searchterm", mockLangCategoryMap);
    expect(result).toEqual([undefined, "searchterm"]);
  });

  it("should handle empty search value after category", () => {
    const result = splitSearchClassTerms("org:", mockLangCategoryMap);
    expect(result).toEqual(["org", ""]);
    const result2 = splitSearchClassTerms("org", mockLangCategoryMap);
    expect(result2).toEqual(["org", ""]);
  });

  it("should handle whitespace around category and value", () => {
    const result = splitSearchClassTerms(
      " type : stream ",
      mockLangCategoryMap,
    );
    expect(result).toEqual(["type", "stream"]);
  });

  it("should handle array type categories", () => {
    const result = splitSearchClassTerms("topic:music", mockLangCategoryMap);
    expect(result).toEqual(["topic", "music"]);
  });

  it("should handle string type categories", () => {
    const result = splitSearchClassTerms(
      "description:test content",
      mockLangCategoryMap,
    );
    expect(result).toEqual(["description", "test content"]);
  });

  it("should preserve colons in search term when no valid category", () => {
    const result = splitSearchClassTerms(
      "something:else:here",
      mockLangCategoryMap,
    );
    expect(result).toEqual([undefined, "something:else:here"]);
  });

  it("should handle empty string input", () => {
    const result = splitSearchClassTerms("", mockLangCategoryMap);
    expect(result).toEqual([undefined, ""]);
  });
});
