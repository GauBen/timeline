import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { checkbox } from "./checkbox.js";

describe("checkbox()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "on");

    assert.deepEqual(checkbox().safeParse(data, "input"), succeed(true));
    assert.deepEqual(checkbox().safeParse(data, "missing"), succeed(false));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");

    assert.deepEqual(checkbox().safeParse(data, "input"), failures.invalid());
    assert.deepEqual(
      checkbox({ required: true }).safeParse(data, "missing"),
      failures.required(),
    );
  });
});
