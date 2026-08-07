# Momo deposit

Collect funds from a customer's mobile money wallet.

## Flow

1. Call `momoDeposit` with the sender's mobile money number.
2. The API responds with a pending status.
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

console.log(result.response_code); // e.g. "2000" from the sandbox
console.log(result.response_description); // human-readable outcome
```

## Parameters

| Field         | Type   | Description                                                 |
| ------------- | ------ | ----------------------------------------------------------- |
| `senderId`    | string | Sender's mobile money number (MSISDN, e.g. `260971234567`). |
| `referenceNo` | string | Your unique transaction reference.                          |
| `amount`      | number | Amount to collect.                                          |

## Response

The response preserves all raw API fields. Notable fields:

- `response_code` — API response code indicating the outcome.
- `response_description` — human-readable description of the outcome.
- `reference_no` — echo of your reference number.
- `phone` — echo of the phone number the deposit was requested for.
- `udf1`–`udf5` — user-defined fields echoed back by the API.

Momo deposit responses report outcome via `response_code` /
`response_description`, **not** a `status` field. A non-success response code
(for example the sandbox's `"2000"` — "No active simulator for the phone
number provided") arrives as a normal HTTP 200 response, not as an exception.
Inspect `response_code` to determine the outcome. Transport-level failures
(non-2xx HTTP, network errors, timeouts) still throw `ZynlePayError` — see
[Error handling](/guide/errors).
