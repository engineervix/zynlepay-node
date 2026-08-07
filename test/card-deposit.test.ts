import { describe, expect, it, vi } from "vitest";
import { ZynlePayClient } from "../src/index.js";

function makeClient() {
  const fetchFn = vi.fn();
  const client = new ZynlePayClient({
    merchantId: "MEC00001",
    apiId: "api-id",
    apiKey: "api-key",
    environment: "sandbox",
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

describe("cardDeposit", () => {
  it("sends runTranAuthCapture with the card channel and full billing details", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(
      okResponse({
        status: "pending",
        reference_no: "ref-4",
        redirect_url: "https://bank.example/checkout",
      }),
    );

    await client.cardDeposit({
      referenceNo: "ref-4",
      amount: 1,
      description: "Order ref-4",
      firstName: "Jane",
      lastName: "Banda",
      address: "1 Cairo Rd",
      email: "jane@example.com",
      phone: "260971234567",
      city: "Lusaka",
      state: "Lusaka",
      currency: "ZMW",
      zipCode: "10101",
      country: "ZMB",
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi");
    expect(JSON.parse(init.body as string)).toEqual({
      auth: {
        merchant_id: "MEC00001",
        api_id: "api-id",
        api_key: "api-key",
        channel: "card",
      },
      data: {
        method: "runTranAuthCapture",
        reference_no: "ref-4",
        amount: "1",
        description: "Order ref-4",
        first_name: "Jane",
        last_name: "Banda",
        address: "1 Cairo Rd",
        email: "jane@example.com",
        phone: "260971234567",
        city: "Lusaka",
        state: "Lusaka",
        currency: "ZMW",
        zip_code: "10101",
        country: "ZMB",
      },
    });
  });

  it("exposes the redirect URL for the bank checkout page", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(
      okResponse({
        status: "pending",
        reference_no: "ref-5",
        redirect_url: "https://bank.example/checkout",
      }),
    );

    const result = await client.cardDeposit({
      referenceNo: "ref-5",
      amount: 1,
      description: "Order ref-5",
      firstName: "Jane",
      lastName: "Banda",
      address: "1 Cairo Rd",
      email: "jane@example.com",
      phone: "260971234567",
      city: "Lusaka",
      state: "Lusaka",
      currency: "ZMW",
      zipCode: "10101",
      country: "ZMB",
    });

    expect(result.redirectUrl).toBe("https://bank.example/checkout");
  });
});
