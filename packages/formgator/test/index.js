import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { form, text } from "../src/index.ts";

describe("basic input types", () => {
  it("should be able to parse a text input", () => {
    const data = new FormData();
    data.append("input1", "hello world");
    data.append("input2", "");

    const schema = form({
      input1: text({ required: true }),
      input2: text(),
    });

    const result = schema.parse(data);

    assert.equal(result.input1, "hello world");
    assert.equal(result.input2, "");
  });

  it("should reject an empty required field", () => {
    const data = new FormData();
    data.append("input", "");

    const schema = form({ input: text({ required: true }) });

    try {
      schema.parse(data);
      assert(false, "Empty field was accepted");
    } catch {
      // Do nothing
    }
  });

  it("should reject a missing required field", () => {
    const data = new FormData();

    const schema = form({ input: text({ required: true }) });

    try {
      schema.parse(data);
      assert(false, "Missing field was accepted");
    } catch {
      // Do nothing
    }
  });

  it("should not throw with safeParse", () => {
    const data = new FormData();
    data.append("input", "");

    const optionalSchema = form({ input: text() });
    const requiredSchema = form({ input: text({ required: true }) });

    try {
      assert.equal(optionalSchema.safeParse(data).success, true);
      assert.equal(requiredSchema.safeParse(data).success, false);
    } catch {
      assert(false, "safeParse threw an error");
    }
  });
});
