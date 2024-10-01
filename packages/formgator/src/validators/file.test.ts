import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { failures, succeed } from "../definitions.js";
import { file } from "./file.js";

describe("file()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    const f = new File([], "file.txt", { type: "text/plain" });
    data.append("input", f);

    assert.deepEqual(file().safeParse(data, "input"), succeed(f));
    assert.deepEqual(
      file({ multiple: true }).safeParse(data, "input"),
      succeed([f]),
    );
    assert.deepEqual(
      file({ accept: [".txt"] }).safeParse(data, "input"),
      succeed(f),
    );
    assert.deepEqual(
      file({ accept: ["text/*"] }).safeParse(data, "input"),
      succeed(f),
    );
    assert.deepEqual(
      file({ accept: ["text/plain"] }).safeParse(data, "input"),
      succeed(f),
    );
    assert.deepEqual(
      file({ multiple: true }).safeParse(data, "missing"),
      succeed([]),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    const f = new File([], "file.txt", { type: "text/plain" });
    data.append("input", "invalid");
    data.append("ok", f);

    assert.deepEqual(file().safeParse(data, "input"), failures.type());
    assert.deepEqual(
      file({ multiple: true }).safeParse(data, "input"),
      failures.type(),
    );
    assert.deepEqual(
      file({ multiple: true, required: true }).safeParse(data, "missing"),
      failures.required(),
    );
    assert.deepEqual(
      file({ accept: [".jpg"] }).safeParse(data, "ok"),
      failures.accept([".jpg"]),
    );
    assert.deepEqual(
      file({ accept: ["image/*"] }).safeParse(data, "ok"),
      failures.accept(["image/*"]),
    );
    assert.deepEqual(
      file({ accept: ["image/jpeg"] }).safeParse(data, "ok"),
      failures.accept(["image/jpeg"]),
    );
    assert.deepEqual(
      file({ multiple: true, accept: [".jpg"] }).safeParse(data, "ok"),
      failures.accept([".jpg"]),
    );
  });
});
