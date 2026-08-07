# Framework recipes

The SDK is plain TypeScript with no framework coupling. These recipes show
idiomatic wiring per framework. In every case: construct one client and reuse
it, and keep credentials in environment variables.

## Express

```ts
import express from "express";
import { ZynlePayClient, parseCallback } from "zynlepay-node";

const app = express();
app.use(express.json());

const zynlepay = new ZynlePayClient({
  merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
  apiId: process.env.ZYNLEPAY_API_ID!,
  apiKey: process.env.ZYNLEPAY_API_KEY!,
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

app.post("/payments/momo", async (req, res, next) => {
  try {
    const result = await zynlepay.momoDeposit({
      senderId: req.body.phone,
      referenceNo: req.body.referenceNo,
      amount: req.body.amount,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post("/zynlepay/callback", (req, res) => {
  const callback = parseCallback(req.body);
  // update your transaction record here
  res.sendStatus(200);
});

app.listen(3000);
```

## AdonisJS

Construct the client in a provider and resolve it from the container:

```ts
// providers/zynlepay_provider.ts
import type { ApplicationService } from "@adonisjs/core/types";
import { ZynlePayClient } from "zynlepay-node";

export default class ZynlePayProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton("zynlepay", () => {
      return new ZynlePayClient({
        merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
        apiId: process.env.ZYNLEPAY_API_ID!,
        apiKey: process.env.ZYNLEPAY_API_KEY!,
        environment: app.inProduction ? "production" : "sandbox",
      });
    });
  }
}
```

```ts
// app/controllers/payments_controller.ts
import type { HttpContext } from "@adonisjs/core/http";
import type { ZynlePayClient } from "zynlepay-node";

export default class PaymentsController {
  async store({ request, response }: HttpContext, zynlepay: ZynlePayClient) {
    const result = await zynlepay.momoDeposit({
      senderId: request.input("phone"),
      referenceNo: request.input("referenceNo"),
      amount: request.input("amount"),
    });
    return response.json(result);
  }
}
```

For simpler setups, exporting a singleton from a module works just as well —
the container pattern is optional.

## Nuxt (server routes)

```ts
// server/utils/zynlepay.ts
import { ZynlePayClient } from "zynlepay-node";

export const zynlepay = new ZynlePayClient({
  merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
  apiId: process.env.ZYNLEPAY_API_ID!,
  apiKey: process.env.ZYNLEPAY_API_KEY!,
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
```

```ts
// server/api/payments/momo.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await zynlepay.momoDeposit({
    senderId: body.phone,
    referenceNo: body.referenceNo,
    amount: body.amount,
  });
});
```

```ts
// server/api/zynlepay/callback.post.ts
import { parseCallback } from "zynlepay-node";

export default defineEventHandler(async (event) => {
  const callback = parseCallback(await readBody(event));
  // update your transaction record here
  return { received: true };
});
```

## Quasar (SSR)

In a Quasar SSR app, use the SDK from your Express-based SSR server exactly as
in the [Express recipe](#express) above. Nothing Quasar-specific is required:
the SDK runs server-side, never in the client bundle.

## TypeScript configuration

The package ships ESM and CommonJS builds with type declarations. Any
`moduleResolution` setting of `node16`, `nodenext`, or `bundler` resolves the
types automatically.
