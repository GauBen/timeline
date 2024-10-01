import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { select } from "./select.js";

describe("select()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "option");
    data.append("multiple", "foo");
    data.append("multiple", "bar");

    assert.deepEqual(
      select(["option"]).safeParse(data, "input"),
      succeed("option"),
    );
    assert.deepEqual(
      select(new Set(["option"])).safeParse(data, "input"),
      succeed("option"),
    );
    assert.deepEqual(
      select((x) => x === "option").safeParse(data, "input"),
      succeed("option"),
    );

    assert.deepEqual(
      select(["foo", "bar"], { multiple: true }).safeParse(data, "multiple"),
      succeed(["foo", "bar"]),
    );
    assert.deepEqual(
      select(["foo", "bar"], { multiple: true }).safeParse(data, "missing"),
      succeed([]),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("file", new File([], "file.txt"));

    assert.deepEqual(
      select(["option"]).safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqual(
      select(["option"], { multiple: true }).safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqual(
      select([], { required: true }).safeParse(data, "missing"),
      failures.type(),
    );
    assert.deepEqual(
      select([], { multiple: true, required: true }).safeParse(data, "missing"),
      failures.required(),
    );
    assert.deepEqual(
      select([], { required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqual(
      select([], { multiple: true }).safeParse(data, "file"),
      failures.type(),
    );
  });
});
