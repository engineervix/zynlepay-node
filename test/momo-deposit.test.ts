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

describe("momoDeposit", () => {
  it("sends runBillPayment with the momo channel and sender_id", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "pending", reference_no: "ref-1" }));

    await client.momoDeposit({
      senderId: "260971234567",
      referenceNo: "ref-1",
      amount: 100,
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi");
    expect(JSON.parse(init.body as string)).toEqual({
      auth: {
        merchant_id: "MEC00001",
        api_id: "api-id",
        api_key: "api-key",
        channel: "momo",
      },
      data: {
        method: "runBillPayment",
        sender_id: "260971234567",
        reference_no: "ref-1",
        amount: "100",
      },
    });
  });

  it("returns the parsed API response", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "pending", reference_no: "ref-9" }));

    const result = await client.momoDeposit({
      senderId: "260971234567",
      referenceNo: "ref-9",
      amount: 5,
    });

    expect(result).toEqual({ status: "pending", reference_no: "ref-9" });
  });

  it("exposes response_code, response_description, phone, and udf fields", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(
      okResponse({
        response_code: "2000",
        response_description: "No active simulator for the phone number provided 260971234567",
        reference_no: "ref-10",
        phone: "260971234567",
        udf1: "",
        udf2: "",
        udf3: "",
        udf4: "",
        udf5: "",
      }),
    );

    const result = await client.momoDeposit({
      senderId: "260971234567",
      referenceNo: "ref-10",
      amount: 1,
    });

    expect(result.response_code).toBe("2000");
    expect(result.response_description).toMatch(/No active simulator/);
    expect(result.phone).toBe("260971234567");
    expect(result.udf1).toBe("");
    expect(result.udf5).toBe("");
  });
});
