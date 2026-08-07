import { describe, expect, it } from "vitest";
import { parseCallback } from "../src/index.js";

describe("parseCallback", () => {
  it("parses a valid callback payload", () => {
    const callback = parseCallback({
      reference_no: "ORDER-1001",
      status: "success",
      amount: "100",
      channel: "momo",
    });

    expect(callback.referenceNo).toBe("ORDER-1001");
    expect(callback.status).toBe("success");
    expect(callback.raw).toEqual({
      reference_no: "ORDER-1001",
      status: "success",
      amount: "100",
      channel: "momo",
    });
  });

  it("rejects a payload missing reference_no", () => {
    expect(() => parseCallback({ status: "success" })).toThrow(/reference_no/);
  });

  it("rejects a payload missing status", () => {
    expect(() => parseCallback({ reference_no: "ORDER-1001" })).toThrow(/status/);
  });

  it("rejects non-object payloads", () => {
    expect(() => parseCallback(null)).toThrow();
    expect(() => parseCallback("success")).toThrow();
  });
});
