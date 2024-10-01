import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { date } from "./date.js";

describe("date()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-09-30");
    data.append("empty", "");

    assert.deepEqual(date().safeParse(data, "input"), succeed("2024-09-30"));
    assert.deepEqual(date().safeParse(data, "empty"), succeed(null));
    assert.deepEqual(
      date({ min: new Date("2024-09-30") }).safeParse(data, "input"),
      succeed("2024-09-30"),
    );
    assert.deepEqual(
      date({ max: new Date("2024-09-30") }).safeParse(data, "input"),
      succeed("2024-09-30"),
    );
    assert.deepEqual(
      date().asNumber().safeParse(data, "input"),
      succeed(Date.parse("2024-09-30")),
    );
    assert.deepEqual(
      date().asDate().safeParse(data, "input"),
      succeed(new Date("2024-09-30")),
    );
    assert.deepEqual(date().asNumber().safeParse(data, "empty"), succeed(null));
    assert.deepEqual(date().asDate().safeParse(data, "empty"), succeed(null));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-13-01");
    data.append("ok", "2024-09-30");

    assert.deepEqual(date().safeParse(data, "missing"), failures.type());
    assert.deepEqual(
      date({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqual(date().safeParse(data, "input"), failures.invalid());
    assert.deepEqual(date().safeParse(data, "nad"), failures.invalid());
    assert.deepEqual(
      date({ min: new Date("2024-10-01") }).safeParse(data, "ok"),
      failures.min(new Date("2024-10-01")),
    );
    assert.deepEqual(
      date({ max: new Date("2024-09-29") }).safeParse(data, "ok"),
      failures.max(new Date("2024-09-29")),
    );
  });
});
