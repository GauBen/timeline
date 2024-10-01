import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "../utils.ts";
import { hidden } from "./hidden.ts";

describe("hidden()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");

    assert.deepEqual(
      hidden().safeParse(data, "input"),
      succeed("hello world!"),
    );
  });

  it("should refuse invalid inputs", () => {
    assert.deepEqual(
      hidden().safeParse(new FormData(), "missing"),
      fail(errorGenerators.type()),
    );
  });
});
