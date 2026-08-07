# Payment status

Look up the current status of any transaction by reference number.

Use this to reconcile records, to verify a callback before fulfilling an
order, and to disambiguate a timed-out payment request before retrying it.

## Example

```ts
const result = await client.paymentStatus({ referenceNo: "ORDER-1001" });
console.log(result.response_code); // "100" success, "990" pending, "995" failed
```

## Parameters

| Field         | Type   | Description                                     |
| ------------- | ------ | ----------------------------------------------- |
| `referenceNo` | string | Reference number of the transaction to look up. |

## Response

The response preserves all raw API fields. Notable fields:

- `response_code` — the field to branch on. Confirmed against a live sandbox
  transaction, across its full lifecycle:
  - `"100"` — successful.
  - `"990"` — indeterminate; check `message` for guidance (the API asks you
    to retry after 60 seconds). This is a normal response, not an error.
  - `"995"` — failed.
- `reference_no` — echo of your reference number.
- `message` — human-readable API message.
- `status` — documented by ZynlePay but not observed in any live sandbox
  response (every one carried `response_code`/`message` only). Don't build
  logic around it being present; use `response_code`.

This operation is idempotent and safe to retry. Throws `ZynlePayError` on
failure — see [Error handling](/guide/errors).
