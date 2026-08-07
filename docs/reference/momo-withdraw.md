# Momo withdraw

Send funds from your ZynlePay wallet to a customer's mobile money wallet
(payout).

## Flow

1. Call `momoWithdraw` with the receiver's mobile money number.
2. On a successful API response, the funds are transferred to the receiver's
   mobile money wallet.
3. ZynlePay delivers the final status to your callback URL. See
   [Handling callbacks](/guide/callbacks).

## Example

```ts
const result = await client.momoWithdraw({
  receiverId: "260971234567",
  referenceNo: "PAYOUT-1001",
  amount: 250,
});
```

## Parameters

| Field         | Type   | Description                                                   |
| ------------- | ------ | ------------------------------------------------------------- |
| `receiverId`  | string | Receiver's mobile money number (MSISDN, e.g. `260971234567`). |
| `referenceNo` | string | Your unique transaction reference.                            |
| `amount`      | number | Amount to send.                                               |

## Response

The response preserves all raw API fields. Notable fields:

- `response_code` — API response code indicating the outcome.
- `response_description` — human-readable description of the outcome.
- `reference_no` — echo of your reference number.
- `phone` — echo of the receiver's phone number.
- `udf1`–`udf5` — user-defined fields echoed back by the API.

<!--@include: ./_shared/response-code-warning.md-->
