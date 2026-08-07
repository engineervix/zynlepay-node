# Handling callbacks

ZynlePay transactions are asynchronous. The API response tells you a request
was accepted; the final outcome — success or failure — is delivered later to
the callback URL configured in your merchant dashboard.

Always update your records from the callback, not from the initial API
response.

## The callback payload

ZynlePay posts a JSON body to your callback URL. The SDK's `parseCallback`
validates the two fields every callback must carry and keeps the raw payload
for anything else:

```ts
import { parseCallback } from "zynlepay-node";

const callback = parseCallback(requestBody);
callback.referenceNo; // string — your transaction reference
callback.status; // string — e.g. "success" or "failed"
callback.raw; // Record<string, unknown> — the full payload
```

`parseCallback` throws if the payload is not an object or is missing
`reference_no` or `status`. Catch that error and respond with a 400 status.

## Example endpoint (Express)

```ts
import express from "express";
import { parseCallback } from "zynlepay-node";

const app = express();
app.use(express.json());

app.post("/zynlepay/callback", (req, res) => {
  let callback;
  try {
    callback = parseCallback(req.body);
  } catch {
    res.sendStatus(400);
    return;
  }

  // Look up the transaction by callback.referenceNo and update its status
  // to callback.status. Then acknowledge receipt:
  res.sendStatus(200);
});
```

## Recommendations

- **Respond quickly.** Acknowledge the callback with a 2xx status before doing
  slow work; queue heavy processing.
- **Be idempotent.** Callbacks may be retried. Updating a transaction to the
  same final status twice should be a no-op.
- **Verify out of band.** When a callback matters (money movement), confirm it
  with [paymentStatus](/reference/payment-status) before fulfilling orders.
- **Log the raw payload.** `callback.raw` preserves fields the SDK doesn't
  type yet; keep it for debugging.
