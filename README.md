# zynlepay-node

*Unofficial* TypeScript SDK for the [ZynlePay](https://zynlepay.com) payments API
(card deposits, mobile money, wallet-to-bank payouts).

Works with any Node.js 22+ runtime - e.g. Express, AdonisJS, Nuxt server routes,
Quasar SSR, or just plain Node. Zero runtime dependencies.

[![CI](https://github.com/engineervix/zynlepay-node/actions/workflows/ci.yml/badge.svg)](https://github.com/engineervix/zynlepay-node/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/engineervix/022ee313a1a2c75231887e17c616e5eb/raw/covbadge.json)](https://github.com/engineervix/zynlepay-node/actions)
[![npm version](https://img.shields.io/npm/v/zynlepay-node.svg)](https://www.npmjs.com/package/zynlepay-node)
[![npm downloads](https://img.shields.io/npm/dm/zynlepay-node.svg)](https://www.npmjs.com/package/zynlepay-node)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-252529?style=for-the-badge&logo=vitest&logoColor=FCC72B)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-192a32?style=for-the-badge&logo=prettier&logoColor=dc524a)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Install](#install)
- [Configure](#configure)
- [Usage](#usage)
  - [Collect a mobile money payment](#collect-a-mobile-money-payment)
  - [Send a mobile money payout](#send-a-mobile-money-payout)
  - [Pay out to a bank account](#pay-out-to-a-bank-account)
  - [Accept a card payment](#accept-a-card-payment)
  - [Check a transaction status](#check-a-transaction-status)
  - [Check your wallet balances](#check-your-wallet-balances)
- [Handling callbacks](#handling-callbacks)
- [Error handling](#error-handling)
- [Smoke test](#smoke-test)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install zynlepay-node
```

## Configure

Generate credentials from your ZynlePay merchant dashboard, then construct one
client and reuse it:

```ts
import { ZynlePayClient } from "zynlepay-node";

const client = new ZynlePayClient({
  merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
  apiId: process.env.ZYNLEPAY_API_ID!,
  apiKey: process.env.ZYNLEPAY_API_KEY!,
  environment: "sandbox", // omit or use "production" for live payments
});
```

Never commit credentials to source control.

## Usage

### Collect a mobile money payment

```ts
const result = await client.momoDeposit({
  senderId: "260971234567",
  referenceNo: "ORDER-1001",
  amount: 100,
});
console.log(result.response_code, result.response_description);
```

The customer approves the payment via a USSD prompt on their phone. The
response reports the outcome via `response_code` / `response_description`
(not `status`), and the final status arrives at your callback URL — see
[Handling callbacks](#handling-callbacks).

### Send a mobile money payout

```ts
const result = await client.momoWithdraw({
  receiverId: "260971234567",
  referenceNo: "PAYOUT-1001",
  amount: 250,
});
console.log(result.response_code, result.response_description);
```

### Pay out to a bank account

```ts
const result = await client.walletToBank({
  receiverId: "62123456789",
  bankName: "fnb",
  referenceNo: "PAYOUT-1002",
  amount: 10,
  description: "Invoice 55 payout",
});
console.log(result.response_code); // "120" on success
```

### Accept a card payment

```ts
const result = await client.cardDeposit({
  referenceNo: "ORDER-1003",
  amount: 1,
  description: "Order 1003",
  firstName: "Jane",
  lastName: "Banda",
  address: "1 Cairo Rd",
  email: "jane@example.com",
  phone: "260971234567",
  city: "Lusaka",
  state: "Lusaka",
  currency: "ZMW",
  zipCode: "10101",
  country: "ZMB",
});

// Redirect the customer to result.redirectUrl to complete the payment
// on the bank's checkout page.
```

### Check a transaction status

```ts
const result = await client.paymentStatus({ referenceNo: "ORDER-1001" });
console.log(result.status);
```

### Check your wallet balances

```ts
const result = await client.checkBalance();
console.log(result.disbursement_balance); // payout wallet
console.log(result.collection_balance); // collection wallet
```

## Handling callbacks

ZynlePay sends the final status of every transaction to the callback URL you
configure in the merchant dashboard. Use `parseCallback` to validate the
payload:

```ts
import { parseCallback } from "zynlepay-node";

// Express example
app.post("/zynlepay/callback", (req, res) => {
  const callback = parseCallback(req.body);
  // callback.referenceNo — your reference
  // callback.status      — e.g. "success" or "failed"
  // callback.raw         — the full payload
  res.sendStatus(200);
});
```

## Error handling

All failures throw `ZynlePayError`, including network errors, timeouts,
non-2xx responses, and API-level failures reported in the response body:

```ts
import { ZynlePayError } from "zynlepay-node";

try {
  await client.momoDeposit({ senderId: "260971234567", referenceNo: "R1", amount: 5 });
} catch (error) {
  if (error instanceof ZynlePayError) {
    console.error(error.message, error.httpStatus, error.responseBody);
  }
}
```

## Smoke test

An optional live smoke test exercises the sandbox endpoints with real
credentials. It runs the read-only operations by default; set
`SMOKE_INCLUDE_PAYMENTS=1` to also create a 1-unit momo deposit.

```bash
ZYNLEPAY_MERCHANT_ID=... \
ZYNLEPAY_API_ID=... \
ZYNLEPAY_API_KEY=... \
npm run smoke
```

## Documentation

Full guides — including per-operation references and framework recipes for
Express, AdonisJS, Nuxt, and Quasar — are available at
**[engineervix.github.io/zynlepay-node](https://engineervix.github.io/zynlepay-node/)**.

The docs live in the `docs/` directory and are built with VitePress. To run
them locally:

```bash
npm run docs:dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

BSD-3-Clause. See [LICENSE](LICENSE).

This is an unofficial SDK and is not affiliated with or endorsed by ZynlePay.
