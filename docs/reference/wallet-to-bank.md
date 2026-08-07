# Wallet to bank

Send funds from your ZynlePay disbursement wallet to a bank account.

## Flow

1. Call `walletToBank` with the bank details and account number.
2. On a successful API response, the funds are transferred to the bank
   account.
3. ZynlePay delivers the final status to your callback URL. See
   [Handling callbacks](/guide/callbacks).

## Example

```ts
const result = await client.walletToBank({
  receiverId: "62123456789",
  bankName: "fnb",
  referenceNo: "PAYOUT-1002",
  amount: 10,
  description: "Invoice 55 payout",
});
```

## Parameters

| Field         | Type   | Description                                    |
| ------------- | ------ | ---------------------------------------------- |
| `receiverId`  | string | Bank account number receiving the funds.       |
| `bankName`    | string | Bank name as expected by the API (e.g. `fnb`). |
| `referenceNo` | string | Your unique transaction reference.             |
| `amount`      | number | Amount to send.                                |
| `description` | string | Description of the transfer.                   |

## Response

The response preserves all raw API fields. On success the sandbox returns a
rich payload; notable fields:

- `response_code` — API response code. `"120"` indicates success.
- `response_description` — human-readable outcome (e.g. `"Successful"`).
- `operatorreference` — the operator's own reference number for the payout.
- `reference_no` — echo of your reference number.
- `receiver_id` — echo of the receiving account number.
- `amount` — transfer amount as reported by the API.
- `currency` — ISO currency code of the transfer (e.g. `ZMW`).
- `accountname` / `birthday` — receiving account holder details, when
  provided by the API.
- `date` / `transaction_date` — transfer date and timestamp.
- `merchant_callback_url` — callback URL registered for this payout.
- `operator` — operator identifier, when present.
- `notification_type` — e.g. `"new"`.

Wallet-to-bank responses report outcome via `response_code` /
`response_description`, **not** a `status` field. Inspect `response_code` to
determine the outcome. Transport-level failures (non-2xx HTTP, network
errors, timeouts) throw `ZynlePayError` — see
[Error handling](/guide/errors).
