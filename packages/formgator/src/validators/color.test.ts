import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "../utils.ts";
import { color } from "./color.ts";

describe("color()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "#ff0000");

    assert.deepEqual(color().safeParse(data, "input"), succeed("#ff0000"));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");

    assert.deepEqual(
      color().safeParse(data, "input"),
      fail(errorGenerators.invalid()),
    );
    assert.deepEqual(
      color().safeParse(data, "missing"),
      fail(errorGenerators.type()),
    );
  });
});
