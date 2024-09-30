import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "./utils.ts";
import { text } from "./validators/text.ts";

describe("methods", () => {
  describe(".transform()", () => {
    it("should transform values", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqual(
        text().transform(BigInt).safeParse(data, "input"),
        succeed(123n),
      );
    });

    it("should catch errors", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqual(
        text()
          .transform(BigInt, () => "Not a number")
          .safeParse(data, "input"),
        fail(errorGenerators.transform("Not a number")),
      );
    });

    it("should be lazy", () => {
      const data = new FormData();
      data.append("input", "nan");

      const input = text({ pattern: /^\d+$/ }).transform(BigInt);

      assert.deepEqual(
        input.safeParse(data, "input"),
        fail(errorGenerators.pattern(/^\d+$/)),
      );
    });
  });

  describe(".refine()", () => {
    it("should accept valid predicates", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqual(
        text()
          .refine((value) => value.startsWith("1"))
          .safeParse(data, "input"),
        succeed("123"),
      );
    });

    it("should refuse invalid predicates", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqual(
        text()
          .refine((value) => value.startsWith("1"))
          .safeParse(data, "input"),
        fail(errorGenerators.refine("Invalid value")),
      );
    });

    it("should use custom messages", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqual(
        text()
          .refine(
            (value) => value.startsWith("1"),
            () => "Nope",
          )
          .safeParse(data, "input"),
        fail(errorGenerators.refine("Nope")),
      );
    });

    it("should be lazy", () => {
      const data = new FormData();
      data.append("input", "nan");

      const input = text({ pattern: /^\d+$/ }).refine((value) =>
        value.startsWith("1"),
      );

      assert.deepEqual(
        input.safeParse(data, "input"),
        fail(errorGenerators.pattern(/^\d+$/)),
      );
    });
  });

  describe(".optional()", () => {
    it("should accept missing fields", () => {
      const data = new FormData();

      assert.deepEqual(
        text().optional().safeParse(data, "input"),
        succeed(undefined),
      );
    });

    it("should accept present fields", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqual(
        text().optional().safeParse(data, "input"),
        succeed("123"),
      );
    });
  });

  it("should be composable", () => {
    const data = new FormData();
    data.append("input", "123");

    const input = text()
      .transform(Number)
      .refine((value) => value % 2 === 1)
      .transform(String);

    assert.deepEqual(input.safeParse(data, "input"), succeed("123"));
  });
});
