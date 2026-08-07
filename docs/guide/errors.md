# Error handling

Every SDK failure throws a `ZynlePayError`. No operation resolves to an error
value or rejects with a foreign error type.

## Catching errors

```ts
import { ZynlePayClient, ZynlePayError } from "zynlepay-node";

try {
  await client.momoDeposit({ senderId: "260971234567", referenceNo: "R1", amount: 5 });
} catch (error) {
  if (error instanceof ZynlePayError) {
    console.error(error.message);
    console.error(error.httpStatus); // HTTP status, when a response was received
    console.error(error.responseBody); // parsed API error body, when available
  } else {
    throw error;
  }
}
```

## Failure categories

| Category           | Cause                                  | `httpStatus` | `responseBody` |
| ------------------ | -------------------------------------- | ------------ | -------------- |
| Network failure    | DNS, connectivity, TLS                 | —            | —              |
| Timeout            | Request exceeded `timeoutMs`           | —            | —              |
| HTTP error         | Non-2xx status from the API            | set          | set (if JSON)  |
| Malformed response | Body was not valid JSON                | set          | —              |
| API-level failure  | 2xx body with `status` of error/failed | —            | set            |

## API-level failures

ZynlePay can return HTTP 200 with a body whose `status` field reports failure
(for example, invalid credentials or insufficient funds). The SDK detects
`status` values of `error`, `failed`, and `failure` and throws a
`ZynlePayError` carrying the API's `message` and the full response body.

## Timeouts

The default request timeout is 30 seconds. Adjust it per client:

```ts
const client = new ZynlePayClient({
  // ...credentials
  timeoutMs: 10_000,
});
```

A timed-out request throws `ZynlePayError` with a message containing
`timed out`.

## Retrying safely

Retry only idempotent lookups ([paymentStatus](/reference/payment-status),
[checkBalance](/reference/balance-check)) automatically.

::: warning Don't blind-retry money-moving operations
A timeout is ambiguous — the API may have accepted the request. Check
`paymentStatus` with the same `referenceNo` before retrying a payment
operation, or you risk double-charging or double-paying out.
:::
