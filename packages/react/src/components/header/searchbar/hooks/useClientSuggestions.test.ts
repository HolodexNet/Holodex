/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useClientSuggestions } from "./useClientSuggestions";
import { useOrgs } from "@/services/orgs.service";
import { renderHook } from "@testing-library/react";
import { t } from "i18next";
import { FIRST_SEARCH } from "../helper";
// import { useOrgs } from "./useOrgs"; // Adjust import path as needed

// Mock the useOrgs hook
vi.mock("@/services/orgs.service", () => ({
  useOrgs: vi.fn(),
}));

// Mock translation function
const mockT = vi.fn(
  (translation: string) => translation,
) as unknown as typeof t;

// Sample test data
const mockOrgs = [
  { name: "Organization One", name_jp: "組織1" },
  { name: "Another Org", name_jp: "別の組織" },
  { name: "Third", name_jp: "第三組織" },
];

describe("useClientSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for useOrgs
    (useOrgs as unknown as any).mockReturnValue({ data: mockOrgs });
  });

  it("returns default array when no search string and no category", () => {
    const { result } = renderHook(() =>
      useClientSuggestions(undefined, "", mockT),
    );

    expect(result.current).toEqual(FIRST_SEARCH);
  });

  it("returns organization suggestions when searching with org category", () => {
    const { result } = renderHook(() =>
      useClientSuggestions("org", "org", mockT),
    );

    expect(result.current).toEqual([
      { type: "org", value: "Organization One", text: "Organization One" },
      { type: "org", value: "Another Org", text: "Another Org" },
    ]);
  });

  it("filters organizations based on search string", () => {
    const { result } = renderHook(() =>
      useClientSuggestions("org", "one", mockT),
    );

    expect(result.current).toEqual([
      {
        type: "org",
        value: "Organization One",
        text: "Organization One",
      },
    ]);
  });

  it("filters organizations based on Japanese name", () => {
    const { result } = renderHook(() =>
      useClientSuggestions("org", "別の", mockT),
    );

    expect(result.current).toEqual([
      {
        type: "org",
        value: "Another Org",
        text: "Another Org",
      },
    ]);
  });

  it("limits organization suggestions to 5 when no category specified", () => {
    const manyOrgs = Array.from({ length: 10 }, (_, i) => ({
      name: `Munchies ${i}`,
      name_jp: `組織${i}`,
    }));
    (useOrgs as any).mockReturnValue({ data: manyOrgs });

    const { result } = renderHook(() =>
      useClientSuggestions(undefined, "munchies", mockT),
    );

    expect(result.current.filter((item) => item.type === "org")).toHaveLength(
      5,
    );
  });

  it("limits organization suggestions to 20 when org category specified", () => {
    const manyOrgs = Array.from({ length: 25 }, (_, i) => ({
      name: `Org ${i}`,
      name_jp: `組織${i}`,
    }));
    (useOrgs as any).mockReturnValue({ data: manyOrgs });

    const { result } = renderHook(() =>
      useClientSuggestions("org", "org", mockT),
    );

    expect(result.current).toHaveLength(20);
  });

  it("includes search suggestion when no category specified", () => {
    const { result } = renderHook(() =>
      useClientSuggestions(undefined, "test search", mockT),
    );

    expect(result.current).toContainEqual({
      type: "search",
      value: "test search",
      text: "test search",
    });
  });

  it("handles undefined orgs data", () => {
    (useOrgs as any).mockReturnValue({ data: undefined });

    const { result } = renderHook(() =>
      useClientSuggestions("org", "test", mockT),
    );

    expect(result.current).toEqual([]);
  });

  it("includes static suggestions when category is specified", () => {
    const { result } = renderHook(() =>
      // @ts-expect-error since it's intentionally wrong
      useClientSuggestions("someCategory", "", mockT),
    );

    // Adjust this expectation based on your STATIC_SUGGESTIONS implementation
    expect(result.current).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "someCategory",
        }),
      ]),
    );
  });
});
