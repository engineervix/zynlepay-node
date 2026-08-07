# Payment status

Look up the current status of any transaction by reference number.

Use this to reconcile records, to verify a callback before fulfilling an
order, and to disambiguate a timed-out payment request before retrying it.

## Example

```ts
const result = await client.paymentStatus({ referenceNo: "ORDER-1001" });
console.log(result.status);
```

## Parameters

| Field         | Type   | Description                                     |
| ------------- | ------ | ----------------------------------------------- |
| `referenceNo` | string | Reference number of the transaction to look up. |

## Response

The response preserves all raw API fields. Notable fields:

- `status` — transaction status as reported by the API.
- `reference_no` — echo of your reference number.
- `response_code` — API response code. A value of `"990"` means the status
  could not be determined yet; check `message` for guidance (the API asks you
  to retry after 60 seconds). This is a normal response, not an error.
- `message` — human-readable API message.

This operation is idempotent and safe to retry. Throws `ZynlePayError` on
failure — see [Error handling](/guide/errors).
