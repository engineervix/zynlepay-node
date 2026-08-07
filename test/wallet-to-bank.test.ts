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

describe("walletToBank", () => {
  it("sends runPayToBank with the bank channel, bank_name and receiver_id", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(okResponse({ status: "success", reference_no: "ref-3" }));

    await client.walletToBank({
      receiverId: "62123456789",
      bankName: "fnb",
      referenceNo: "ref-3",
      amount: 10,
      description: "Payout for invoice 55",
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://sandbox.zynlepay.com/zynlepay/jsonapi");
    expect(JSON.parse(init.body as string)).toEqual({
      auth: {
        merchant_id: "MEC00001",
        api_id: "api-id",
        api_key: "api-key",
        channel: "bank",
      },
      data: {
        method: "runPayToBank",
        reference_no: "ref-3",
        amount: "10",
        description: "Payout for invoice 55",
        bank_name: "fnb",
        receiver_id: "62123456789",
      },
    });
  });

  it("exposes the rich payout fields returned on success", async () => {
    const { client, fetchFn } = makeClient();
    fetchFn.mockResolvedValue(
      okResponse({
        response_code: "120",
        response_description: "Successful",
        operatorreference: 10000000000,
        reference_no: "ref-12",
        accountname: "NA",
        birthday: "NA",
        currency: "ZMW",
        date: "2026-08-07 13:04:27",
        merchant_callback_url: "",
        amount: "1",
        receiver_id: "62123456789",
        operator: "",
        transaction_date: "2026-08-07 13:04:27",
        notification_type: "new",
      }),
    );

    const result = await client.walletToBank({
      receiverId: "62123456789",
      bankName: "fnb",
      referenceNo: "ref-12",
      amount: 1,
      description: "smoke test",
    });

    expect(result.response_code).toBe("120");
    expect(result.response_description).toBe("Successful");
    expect(result.operatorreference).toBe(10000000000);
    expect(result.accountname).toBe("NA");
    expect(result.currency).toBe("ZMW");
    expect(result.amount).toBe("1");
    expect(result.receiver_id).toBe("62123456789");
    expect(result.notification_type).toBe("new");
  });
});
