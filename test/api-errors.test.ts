import { describe, expect, it, vi } from "vitest";
import { ZynlePayClient, ZynlePayError } from "../src/index.js";

function makeClient() {
  const fetchFn = vi.fn();
  const client = new ZynlePayClient({
    merchantId: "MEC00001",
    apiId: "api-id",
    apiKey: "api-key",
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

describe("API-level errors", () => {
  it("raises ZynlePayError when a 200 response carries an explicit error status", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "error", message: "Invalid API key" }));

    const error = await client
      .momoDeposit({ senderId: "260971234567", referenceNo: "ref-1", amount: 1 })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ZynlePayError);
    expect((error as ZynlePayError).message).toMatch(/Invalid API key/);
    expect((error as ZynlePayError).responseBody).toEqual({
      status: "error",
      message: "Invalid API key",
    });
  });

  it("raises ZynlePayError when a 200 response carries a failed status", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "failed", message: "Insufficient funds" }));

    const error = await client
      .momoWithdraw({ receiverId: "260971234567", referenceNo: "ref-2", amount: 10 })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ZynlePayError);
    expect((error as ZynlePayError).message).toMatch(/Insufficient funds/);
  });

  it("does not raise for success or pending statuses", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "pending", reference_no: "ref-3" }));

    const result = await client.momoDeposit({
      senderId: "260971234567",
      referenceNo: "ref-3",
      amount: 1,
    });
    expect(result.status).toBe("pending");
  });
});
