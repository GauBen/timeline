import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as fg from "../src/index.ts";

describe("text()", () => {
  it("should be able to parse a text input", () => {
    const data = new FormData();
    data.append("input1", "hello world");
    data.append("input2", "");

    const schema = fg.form({
      input1: fg.text({ required: true }),
      input2: fg.text(),
    });

    const result = schema.parse(data);

    assert.equal(result.input1, "hello world");
    assert.equal(result.input2, "");
  });

  it("should reject an empty required field", () => {
    const data = new FormData();
    data.append("input", "");

    const schema = fg.form({ input: fg.text({ required: true }) });

    try {
      schema.parse(data);
      assert(false, "Empty field was accepted");
    } catch {
      // Do nothing
    }
  });

  it("should reject a missing field", () => {
    const data = new FormData();

    const schema = fg.form({ input: fg.text() });

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

    const optionalSchema = fg.form({ input: fg.text() });
    const requiredSchema = fg.form({ input: fg.text({ required: true }) });

    try {
      assert.equal(optionalSchema.safeParse(data).success, true);
      assert.equal(requiredSchema.safeParse(data).success, false);
    } catch {
      assert(false, "safeParse threw an error");
    }
  });

  it("should trim values properly", () => {
    const data = new FormData();
    data.append("input", "  hello world  ");

    const schema = fg.form({
      input: fg.text({ required: true }).trim(),
    });

    const result = schema.parse(data);

    assert.equal(result.input, "hello world");
  });

  it("should support all attributes", () => {
    const data = new FormData();
    data.append("input", "hello world");

    try {
      const result = fg.form({ input: fg.text({ minlength: 11 }) }).parse(data);
      assert.equal(result.input, "hello world");
    } catch {
      assert(false, "Failed to validate minlength");
    }

    try {
      const result = fg.form({ input: fg.text({ maxlength: 11 }) }).parse(data);
      assert.equal(result.input, "hello world");
    } catch {
      assert(false, "Failed to validate maxlength");
    }

    try {
      const result = fg
        .form({ input: fg.text({ pattern: /^hello/ }) })
        .parse(data);
      assert.equal(result.input, "hello world");
    } catch {
      assert(false, "Failed to validate pattern");
    }
  });

  it("should reject if attributes don't match", () => {
    const data = new FormData();
    data.append("input", "hello world");

    try {
      fg.form({ input: fg.text({ minlength: 12 }) }).parse(data);
      assert(false, "Failed to validate minlength");
    } catch {
      // Do nothing
    }

    try {
      fg.form({ input: fg.text({ maxlength: 10 }) }).parse(data);
      assert(false, "Failed to validate maxlength");
    } catch {
      // Do nothing
    }

    try {
      fg.form({ input: fg.text({ pattern: /hello$/ }) }).parse(data);
      assert(false, "Failed to validate pattern");
    } catch {
      // Do nothing
    }
  });
});

describe("checkbox()", () => {
  it("should be able to parse a checkbox input", () => {
    const data = new FormData();
    data.append("input", "on");

    const schema = fg.form({
      input: fg.checkbox(),
      nothing: fg.checkbox(),
    });

    const result = schema.parse(data);

    assert.equal(result.input, true);
    assert.equal(result.nothing, false);
  });

  it("should reject a missing required checkbox", () => {
    const schema = fg.form({ input: fg.checkbox({ required: true }) });

    try {
      schema.parse(new FormData());
      assert(false, "Missing field was accepted");
    } catch {
      // Do nothing
    }
  });
});

describe("color()", () => {
  it("should be able to parse a color input", () => {
    const data = new FormData();
    data.append("input", "#ff0000");

    const schema = fg.form({ input: fg.color() });

    const result = schema.parse(data);

    assert.equal(result.input, "#ff0000");
  });

  it("should reject an invalid color", () => {
    const data = new FormData();
    data.append("input", "#ff000");

    const schema = fg.form({ input: fg.color() });

    try {
      schema.parse(data);
      assert(false, "Invalid color was accepted");
    } catch {
      // Do nothing
    }
  });
});

describe("date()", () => {
  it("should be able to parse a date input", () => {
    const data = new FormData();
    data.append("input", "2021-01-01");

    const schema = fg.form({ input: fg.date() });

    const result = schema.parse(data);

    assert.equal(result.input, "2021-01-01");
  });

  it("should reject an invalid date", () => {
    const data = new FormData();
    data.append("input", "2021-01-32");

    const schema = fg.form({ input: fg.date() });

    try {
      schema.parse(data);
      assert(false, "Invalid date was accepted");
    } catch {
      // Do nothing
    }
  });

  it("should convert dates to number and Date", () => {
    const data = new FormData();
    data.append("input", "2021-01-01");

    const number = fg.form({ input: fg.date().asNumber() }).parse(data);
    const date = fg.form({ input: fg.date().asDate() }).parse(data);

    assert.equal(number.input, 1609459200000);
    assert.deepEqual(date.input, new Date("2021-01-01"));
  });
});

describe(".refine()", () => {
  it("should work", () => {
    const data = new FormData();
    data.append("input", "hello world");

    const schema = fg.form({
      input: fg.text().refine((value) => value === "hello folks"),
    });

    const result = schema.safeParse(data);

    assert.equal(result.success, false);
  });
});

it("supports URLSearchParams", () => {
  const data = new URLSearchParams("?page=10");

  const schema = fg.form({
    page: fg.number({ required: true }),
    cursor: fg.text().nullable(),
  });

  const result = schema.parse(data);

  assert.equal(result.page, 10);
  assert.equal(result.cursor, null);
});
