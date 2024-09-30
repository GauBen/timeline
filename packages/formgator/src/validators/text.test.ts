import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "../utils.ts";
import { text } from "./text.ts";

describe("text()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");
    data.append("trim", "  hello ");

    assert.deepEqual(text().safeParse(data, "input"), succeed("hello world!"));
    assert.deepEqual(
      text({ minlength: 12 }).safeParse(data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqual(
      text({ maxlength: 12 }).safeParse(data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqual(
      text({ pattern: /^\w+ \w+!$/u }).safeParse(data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqual(text().trim().safeParse(data, "trim"), succeed("hello"));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "new\nline");
    data.append("empty", "");
    data.append("ok", "hello world!");

    assert.deepEqual(
      text().safeParse(data, "input"),
      fail(errorGenerators.invalid()),
    );
    assert.deepEqual(
      text().safeParse(data, "missing"),
      fail(errorGenerators.type()),
    );
    assert.deepEqual(
      text({ required: true }).safeParse(data, "empty"),
      fail(errorGenerators.required()),
    );
    assert.deepEqual(
      text({ minlength: 13 }).safeParse(data, "ok"),
      fail(errorGenerators.minlength(13)),
    );
    assert.deepEqual(
      text({ maxlength: 11 }).safeParse(data, "ok"),
      fail(errorGenerators.maxlength(11)),
    );
    assert.deepEqual(
      text({ pattern: /^\w+ \w+\?$/u }).safeParse(data, "ok"),
      fail(errorGenerators.pattern(/^\w+ \w+\?$/u)),
    );
  });
});
