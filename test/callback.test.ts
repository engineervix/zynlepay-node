import { describe, expect, it } from "vitest";
import { parseCallback } from "../src/index.js";

describe("parseCallback", () => {
  it("parses a real successful momo deposit callback", () => {
    // Captured verbatim from a live ZynlePay sandbox callback. There is no
    // "status" field anywhere in the real payload - response_code is what
    // actually carries the outcome.
    const payload = {
      response_code: "100",
      response_description: "SUCCESSFUL",
      reference_no: "ACCEPT-1786127909926",
      operatorreference: 8318881713,
      accountname: "NA",
      birthday: "NA",
      currency: "NA",
      date: "NA",
      amount: "1",
      sender_id: "260970123456",
    };

    const callback = parseCallback(payload);

    expect(callback.referenceNo).toBe("ACCEPT-1786127909926");
    expect(callback.responseCode).toBe("100");
    expect(callback.status).toBe("success");
    expect(callback.raw).toEqual(payload);
  });

  it("parses a real failed momo deposit callback", () => {
    // Also captured verbatim from a live sandbox callback (a declined USSD
    // prompt). Same shape as the success case, just a different code.
    const payload = {
      response_code: "995",
      response_description: "Transaction Failed",
      reference_no: "DECLINE-1786127707204",
      operatorreference: 5460551170,
      accountname: "NA",
      birthday: "NA",
      currency: "NA",
      date: "NA",
      amount: "1",
      sender_id: "",
    };

    const callback = parseCallback(payload);

    expect(callback.responseCode).toBe("995");
    expect(callback.status).toBe("failed");
  });

  it("treats an unrecognized response_code as failed, never as success", () => {
    // Only "100" is a confirmed success code. Anything not explicitly
    // recognized must never be reported as success - a code ZynlePay adds
    // later, or one this SDK simply hasn't seen yet, should fail closed.
    const callback = parseCallback({
      response_code: "9902",
      reference_no: "ORDER-1001",
    });

    expect(callback.status).toBe("failed");
  });

  it("rejects a payload missing reference_no", () => {
    expect(() => parseCallback({ response_code: "100" })).toThrow(/reference_no/);
  });

  it("rejects a payload missing response_code", () => {
    expect(() => parseCallback({ reference_no: "ORDER-1001" })).toThrow(/response_code/);
  });

  it("rejects non-object payloads", () => {
    expect(() => parseCallback(null)).toThrow();
    expect(() => parseCallback("success")).toThrow();
  });
});
