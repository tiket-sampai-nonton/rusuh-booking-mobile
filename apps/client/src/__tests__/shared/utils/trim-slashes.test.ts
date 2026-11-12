import {
  trimLeadingSlashes,
  trimTrailingSlashes,
} from "@shared/utils/trim-slashes";

describe("slash trimming helpers", () => {
  it("removes all leading separators and preserves the remaining path", () => {
    expect(trimLeadingSlashes("///api/v1///events")).toBe("api/v1///events");
  });

  it("removes all trailing separators and preserves the base path", () => {
    expect(trimTrailingSlashes("https://example.test/api/v1///")).toBe(
      "https://example.test/api/v1",
    );
  });

  it("returns an empty string when the value contains only separators", () => {
    expect(trimLeadingSlashes("///")).toBe("");
    expect(trimTrailingSlashes("///")).toBe("");
  });

  it("preserves supplementary Unicode characters next to separators", () => {
    expect(trimLeadingSlashes("///🎟️/event")).toBe("🎟️/event");
    expect(trimTrailingSlashes("/event/🎟️///")).toBe("/event/🎟️");
  });
});
