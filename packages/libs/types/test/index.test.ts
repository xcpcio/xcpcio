import { describe, expect, it } from "vitest";
import { one, two } from "@/index";

describe("should", () => {
  it("exported", () => {
    expect(one).toEqual(1);
    expect(two).toEqual(2);
  });
});
