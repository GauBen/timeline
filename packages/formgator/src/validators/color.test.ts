import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { color } from "./color.js";

describe("color()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "#ff0000");

    assert.deepEqual(color().safeParse(data, "input"), succeed("#ff0000"));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");

    assert.deepEqual(color().safeParse(data, "input"), failures.invalid());
    assert.deepEqual(color().safeParse(data, "missing"), failures.type());
  });
});
