import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorGenerators, fail, succeed } from "../utils.ts";
import { file } from "./file.ts";

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

    assert.deepEqual(
      file().safeParse(data, "input"),
      fail(errorGenerators.type()),
    );
    assert.deepEqual(
      file({ multiple: true }).safeParse(data, "input"),
      fail(errorGenerators.type()),
    );
    assert.deepEqual(
      file({ multiple: true, required: true }).safeParse(data, "missing"),
      fail(errorGenerators.required()),
    );
    assert.deepEqual(
      file({ accept: [".jpg"] }).safeParse(data, "ok"),
      fail(errorGenerators.accept([".jpg"])),
    );
    assert.deepEqual(
      file({ accept: ["image/*"] }).safeParse(data, "ok"),
      fail(errorGenerators.accept(["image/*"])),
    );
    assert.deepEqual(
      file({ accept: ["image/jpeg"] }).safeParse(data, "ok"),
      fail(errorGenerators.accept(["image/jpeg"])),
    );
    assert.deepEqual(
      file({ multiple: true, accept: [".jpg"] }).safeParse(data, "ok"),
      fail(errorGenerators.accept([".jpg"])),
    );
  });
});
