import { describe, expect, it, vi } from "vitest";
import { ZynlePayClient } from "../src/index.js";

function makeClient(environment: "sandbox" | "production" = "sandbox") {
  const fetchFn = vi.fn();
  const client = new ZynlePayClient({
    merchantId: "MEC00001",
    apiId: "api-id",
    apiKey: "api-key",
    environment,
    fetchFn,
  });
  return { client, fetchFn };
}

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("paymentStatus", () => {
  it("posts a flat api_id/api_key/reference_no body to the sandbox paymentstatus URL", async () => {
    const { client, fetchFn } = makeClient("sandbox");
    fetchFn.mockResolvedValue(okResponse({ status: "success", reference_no: "ref-1" }));

    await client.paymentStatus({ referenceNo: "ref-1" });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi/paymentstatus");
    expect(JSON.parse(init.body as string)).toEqual({
      api_id: "api-id",
      api_key: "api-key",
      reference_no: "ref-1",
    });
  });

  it("uses the production paymentstatus URL in production", async () => {
    const { client, fetchFn } = makeClient("production");
    fetchFn.mockResolvedValue(okResponse({ status: "success", reference_no: "ref-1" }));

    await client.paymentStatus({ referenceNo: "ref-1" });

    const [url] = fetchFn.mock.calls[0] as [string];
    expect(url).toBe("https://payments.zynlepay.com/zynlepay/paymentstatus");
  });

  it("exposes response_code and message for indeterminate statuses", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(
      okResponse({
        response_code: "990",
        message: "Cant determine status of transaction now. Try again after 60 seconds",
        reference_no: "ref-1",
      }),
    );

    const result = await client.paymentStatus({ referenceNo: "ref-1" });
    expect(result.response_code).toBe("990");
    expect(result.message).toMatch(/60 seconds/);
  });
});

describe("checkBalance", () => {
  it("sends the checkBalance method with auth only", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ disbursement_balance: "100", collection_balance: "0" }));

    const result = await client.checkBalance();

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi");
    expect(JSON.parse(init.body as string)).toEqual({
      auth: {
        merchant_id: "MEC00001",
        api_id: "api-id",
        api_key: "api-key",
      },
      data: { method: "checkBalance" },
    });
    expect(result).toEqual({ disbursement_balance: "100", collection_balance: "0" });
  });

  it("exposes typed balance fields", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ disbursement_balance: "100", collection_balance: "0" }));

    const result = await client.checkBalance();
    expect(result.disbursement_balance).toBe("100");
    expect(result.collection_balance).toBe("0");
  });
});
