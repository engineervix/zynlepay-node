import { describe, expect, it } from "vitest";
import { resolveBaseUrls, ZynlePayClient } from "../src/index.js";

describe("resolveBaseUrls", () => {
  it("returns sandbox URLs for the sandbox environment", () => {
    const urls = resolveBaseUrls("sandbox");
    expect(urls.api).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi");
    expect(urls.paymentStatus).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi/paymentstatus");
  });

  it("returns production URLs for the production environment", () => {
    const urls = resolveBaseUrls("production");
    expect(urls.api).toBe("https://payments.zynlepay.com/zynlepay/jsonapi");
    expect(urls.paymentStatus).toBe("https://payments.zynlepay.com/zynlepay/paymentstatus");
  });
});

describe("ZynlePayClient constructor", () => {
  it("throws when required config fields are missing", () => {
    expect(
      () =>
        new ZynlePayClient({
          merchantId: "",
          apiId: "api-id",
          apiKey: "api-key",
        }),
    ).toThrow(/merchantId/);
  });

  it("throws when apiId is missing", () => {
    expect(
      () =>
        new ZynlePayClient({
          merchantId: "merchant",
          apiId: "",
          apiKey: "api-key",
        }),
    ).toThrow(/apiId/);
  });

  it("throws when apiKey is missing", () => {
    expect(
      () =>
        new ZynlePayClient({
          merchantId: "merchant",
          apiId: "api-id",
          apiKey: "",
        }),
    ).toThrow(/apiKey/);
  });

  it("defaults to the sandbox environment", () => {
    const client = new ZynlePayClient({
      merchantId: "merchant",
      apiId: "api-id",
      apiKey: "api-key",
    });
    expect(client.environment).toBe("sandbox");
  });
});
