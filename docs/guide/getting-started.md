# Getting started

zynlepay-node is a TypeScript client for the ZynlePay payments API. This page
gets you from installation to your first sandbox payment.

## Prerequisites

- Node.js 22 or newer
- A ZynlePay merchant account with sandbox credentials (generate them from the
  application settings in your merchant dashboard)

## Installation

```bash
npm install zynlepay-node
```

## Create a client

::: warning
Store credentials in environment variables — never in source control.
:::

```ts
import { ZynlePayClient } from "zynlepay-node";

const client = new ZynlePayClient({
  merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
  apiId: process.env.ZYNLEPAY_API_ID!,
  apiKey: process.env.ZYNLEPAY_API_KEY!,
  environment: "sandbox",
});
```

`environment` defaults to `"sandbox"`. Set it to `"production"` for live
payments.

## Make your first payment

Collect 100 ZMW from a mobile money wallet:

```ts
const result = await client.momoDeposit({
  senderId: "260971234567",
  referenceNo: "ORDER-1001",
  amount: 100,
});

console.log(result.response_code); // e.g. "2000" from the sandbox
console.log(result.response_description); // human-readable outcome
```

The customer approves the transaction via a USSD prompt on their phone. Momo
deposit responses report the outcome via `response_code` and
`response_description` — inspect `response_code` to determine the result. The
final status is delivered to your callback URL — see
[Handling callbacks](/guide/callbacks).

## Choose a unique reference number

`referenceNo` is how you correlate API responses, callbacks, and status checks
with your own records. Generate one per transaction (an order ID, a UUID) and
store it before calling the API.

## Next steps

- [Handling callbacks](/guide/callbacks) — receive final transaction statuses
- [Error handling](/guide/errors) — handle failures safely
- [Framework recipes](/guide/frameworks) — Express, AdonisJS, Nuxt, Quasar
- [API reference](/reference/card-deposit) — every operation in detail
