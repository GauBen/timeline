import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { time } from "./time.js";

describe("time()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "15:42");
    data.append("empty", "");
    assert.deepEqualTyped(
      time({ required: true }).safeParse(data, "input"),
      succeed("15:42"),
    );
    assert.deepEqualTyped(time().safeParse(data, "empty"), succeed(null));
    assert.deepEqualTyped(
      time({ min: "15:42" }).safeParse(data, "input"),
      succeed("15:42"),
    );
    assert.deepEqualTyped(
      time({ max: "15:42" }).safeParse(data, "input"),
      succeed("15:42"),
    );
    assert.deepEqualTyped(
      time().asSeconds().safeParse(data, "input"),
      succeed(15 * 3600 + 42 * 60),
    );
    assert.deepEqualTyped(
      time().asSeconds().safeParse(data, "empty"),
      succeed(null),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "15:60");
    data.append("ok", "15:43");

    assert.deepEqualTyped(time().safeParse(data, "missing"), failures.type());
    assert.deepEqualTyped(
      time({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(time().safeParse(data, "input"), failures.invalid());
    assert.deepEqualTyped(time().safeParse(data, "nad"), failures.invalid());
    assert.deepEqualTyped(
      time({ min: "15:44" }).safeParse(data, "ok"),
      failures.min("15:44"),
    );
    assert.deepEqualTyped(
      time({ max: "15:42" }).safeParse(data, "ok"),
      failures.max("15:42"),
    );
  });
});