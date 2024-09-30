import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as fg from "../src/index.ts";
import { errorGenerators } from "./utils.ts";

describe("form()", () => {
  describe(".safeParse()", () => {
    it("should support FormData", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg.form({ input: fg.text() }).safeParse(data);

      assert.equal(result.success, true);
      assert.equal(result.data.input, "hello world!");
    });

    it("should support URLSearchParams", () => {
      const data = new URLSearchParams("?input=hello+world!");

      const result = fg.form({ input: fg.text() }).safeParse(data);

      assert.equal(result.success, true);
      assert.equal(result.data.input, "hello world!");
    });

    it("should refuse invalid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg
        .form({ input: fg.text({ maxlength: 10 }) })
        .safeParse(data);

      assert.equal(result.success, false);
      assert.deepEqual(result.error.input, errorGenerators.maxlength(10));
    });
  });

  describe(".parse()", () => {
    it("should accept valid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg.form({ input: fg.text() }).parse(data);

      assert.equal(result.input, "hello world!");
    });

    it("should throw on invalid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      try {
        fg.form({ input: fg.text({ maxlength: 10 }) }).parse(data);
        assert.fail("Expected an error");
      } catch (error) {
        assert(error instanceof fg.FormgatorError);
        assert.deepEqual(error.issues.input, errorGenerators.maxlength(10));
      }
    });
  });
});
