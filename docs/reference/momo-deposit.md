# Momo deposit

Collect funds from a customer's mobile money wallet.

## Flow

1. Call `momoDeposit` with the sender's mobile money number.
2. The API responds with `response_code: "120"` (accepted).
3. The customer receives a USSD PIN prompt on their phone and approves.
4. ZynlePay delivers the final status to your callback URL. See
   [Handling callbacks](/guide/callbacks).

## Example

```ts
const result = await client.momoDeposit({
  senderId: "260971234567",
  referenceNo: "ORDER-1001",
  amount: 100,
});

console.log(result.response_code); // "120" once accepted
console.log(result.response_description); // "Transaction is initiated"
```

## Parameters

| Field         | Type   | Description                                                 |
| ------------- | ------ | ----------------------------------------------------------- |
| `senderId`    | string | Sender's mobile money number (MSISDN, e.g. `260971234567`). |
| `referenceNo` | string | Your unique transaction reference.                          |
| `amount`      | number | Amount to collect.                                          |

## Response

The response preserves all raw API fields. Notable fields:

- `response_code` — the field to branch on. Confirmed against a live
  sandbox:
  - `"120"` — accepted; the customer will get a USSD prompt. Not the final
    outcome — poll [paymentStatus](/reference/payment-status) or wait for
    the callback.
  - `"2000"` — sandbox-only: no active simulator configured for that
    MSISDN. Has no production equivalent; configure a simulator number in
    the merchant dashboard to get past this in sandbox testing.
  - `"995"` (failed) and the `9900`–`9915` merchant/config-error range (bad
    credentials, IP not whitelisted, insufficient merchant balance,
    duplicate reference, etc.) are documented by ZynlePay but this
    endpoint's own initial response hasn't produced them directly — they've
    shown up via [paymentStatus](/reference/payment-status) and the
    callback instead. Treat any `response_code` other than `"120"` as a
    rejection rather than something to wait out; a merchant/config-level
    error will never resolve itself through a later poll.
- `response_description` — human-readable description of the outcome.
- `reference_no` — echo of your reference number.
- `transaction_id` — ZynlePay's own id for the transaction (a number).
- `operatorreference` — the mobile money operator's own reference (a number,
  no underscore — some ZynlePay material spells this `operator_reference`,
  but the real API doesn't).
- `sender_id`, `operator`, `transaction_date` — echoed back once accepted.
- `phone` — echo of the phone number the deposit was requested for.
- `udf1`–`udf5` — user-defined fields echoed back by the API.

<!--@include: ./_shared/response-code-warning.md-->
