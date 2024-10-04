import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { email } from "./email.js";

describe("email()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "gautier@example.com");
    data.append("multiple", "gautier@example.com, gautier@example.net");
    data.append("empty", "");

    assert.deepEqualTyped(
      email().safeParse(data, "input"),
      succeed("gautier@example.com"),
    );
    assert.deepEqualTyped(email().safeParse(data, "empty"), succeed(null));
    assert.deepEqualTyped(
      email({ multiple: true }).safeParse(data, "multiple"),
      succeed(["gautier@example.com", "gautier@example.net"]),
    );
    assert.deepEqualTyped(
      email({ multiple: true }).safeParse(data, "empty"),
      succeed([]),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");

    assert.deepEqualTyped(email().safeParse(data, "missing"), failures.type());
    assert.deepEqualTyped(
      email({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(email().safeParse(data, "input"), failures.invalid());
    assert.deepEqualTyped(
      email({ multiple: true }).safeParse(data, "input"),
      failures.invalid(),
    );
  });
});
