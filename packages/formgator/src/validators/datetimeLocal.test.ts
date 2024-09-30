import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "../utils.ts";
import { datetimeLocal } from "./datetimeLocal.ts";

describe("date()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-09-30T22:45");
    data.append("empty", "");

    assert.deepEqual(
      datetimeLocal().safeParse(data, "input"),
      succeed("2024-09-30T22:45"),
    );
    assert.deepEqual(datetimeLocal().safeParse(data, "empty"), succeed(null));
    assert.deepEqual(
      datetimeLocal({
        min: new Date("2024-09-30T22:45"),
      }).safeParse(data, "input"),
      succeed("2024-09-30T22:45"),
    );
    assert.deepEqual(
      datetimeLocal({
        max: new Date("2024-09-30T22:45"),
      }).safeParse(data, "input"),
      succeed("2024-09-30T22:45"),
    );
    assert.deepEqual(
      datetimeLocal().asNumber().safeParse(data, "input"),
      succeed(Date.parse("2024-09-30T22:45")),
    );
    assert.deepEqual(
      datetimeLocal().asDate().safeParse(data, "input"),
      succeed(new Date("2024-09-30T22:45")),
    );
    assert.deepEqual(
      datetimeLocal().asNumber().safeParse(data, "empty"),
      succeed(null),
    );
    assert.deepEqual(
      datetimeLocal().asDate().safeParse(data, "empty"),
      succeed(null),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-13-01T22:45");
    data.append("ok", "2024-09-30T22:45");

    assert.deepEqual(
      datetimeLocal().safeParse(data, "missing"),
      fail(errorGenerators.type()),
    );
    assert.deepEqual(
      datetimeLocal({ required: true }).safeParse(data, "empty"),
      fail(errorGenerators.required()),
    );
    assert.deepEqual(
      datetimeLocal().safeParse(data, "input"),
      fail(errorGenerators.invalid()),
    );
    assert.deepEqual(
      datetimeLocal().safeParse(data, "nad"),
      fail(errorGenerators.invalid()),
    );
    assert.deepEqual(
      datetimeLocal({
        min: new Date("2024-09-30T22:46"),
      }).safeParse(data, "ok"),
      fail(errorGenerators.min(new Date("2024-09-30T22:46"))),
    );
    assert.deepEqual(
      datetimeLocal({
        max: new Date("2024-09-30T22:44"),
      }).safeParse(data, "ok"),
      fail(errorGenerators.max(new Date("2024-09-30T22:44"))),
    );
  });
});
