import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { number } from "./number.js";

describe("number()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "123");
    data.append("float", "123.456");
    data.append("empty", "");

    assert.deepEqual(number().safeParse(data, "input"), succeed(123));
    assert.deepEqual(
      number({ step: 0 }).safeParse(data, "float"),
      succeed(123.456),
    );
    assert.deepEqual(number().safeParse(data, "empty"), succeed(null));
    assert.deepEqual(
      number({ min: 123 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqual(
      number({ max: 123 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqual(
      number({ step: 3 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqual(
      number({ min: 77, step: 23 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqual(
      number({ min: 122.956, step: 0.5 }).safeParse(data, "float"),
      succeed(123.456),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("ok", "123");

    assert.deepEqual(number().safeParse(data, "missing"), failures.type());
    assert.deepEqual(
      number({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqual(number().safeParse(data, "input"), failures.invalid());
    assert.deepEqual(
      number({ min: 124 }).safeParse(data, "ok"),
      failures.min(124),
    );
    assert.deepEqual(
      number({ max: 122 }).safeParse(data, "ok"),
      failures.max(122),
    );
    assert.deepEqual(
      number({ step: 2 }).safeParse(data, "ok"),
      failures.step(2),
    );
  });
});
