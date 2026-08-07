/**
 * Live smoke test against the ZynlePay sandbox API.
 *
 * Not part of the unit test suite. Run it manually with real sandbox
 * credentials:
 *
 *   ZYNLEPAY_MERCHANT_ID=... \
 *   ZYNLEPAY_API_ID=... \
 *   ZYNLEPAY_API_KEY=... \
 *   npm run smoke
 *
 * Optional variables:
 *   ZYNLEPAY_SMOKE_MSISDN       — mobile money number to use (default 260971234567)
 *   ZYNLEPAY_SMOKE_BANK_ACCOUNT — bank account for walletToBank (default 62123456789)
 *   ZYNLEPAY_SMOKE_BANK_NAME    — bank name for walletToBank (default "fnb")
 *
 * The script exercises the two read-only endpoints against the sandbox and
 * prints the raw responses so you can inspect the real response shapes.
 * Money-moving operations (momoDeposit, momoWithdraw, walletToBank,
 * cardDeposit) are NOT called by default because they create real
 * transactions; set SMOKE_INCLUDE_PAYMENTS=1 to include them (1 unit each,
 * each with a unique reference suffix).
 */
import { ZynlePayClient, ZynlePayError } from "../dist/index.mjs";

const required = ["ZYNLEPAY_MERCHANT_ID", "ZYNLEPAY_API_ID", "ZYNLEPAY_API_KEY"] as const;
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  console.error("Set them and re-run. See the header comment in scripts/smoke.ts.");
  process.exit(1);
}

const client = new ZynlePayClient({
  merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
  apiId: process.env.ZYNLEPAY_API_ID!,
  apiKey: process.env.ZYNLEPAY_API_KEY!,
  environment: "sandbox",
});

const msisdn = process.env.ZYNLEPAY_SMOKE_MSISDN ?? "260971234567";

async function run(name: string, fn: () => Promise<unknown>): Promise<boolean> {
  process.stdout.write(`▸ ${name} ... `);
  try {
    const result = await fn();
    console.log("OK");
    console.log("  response:", JSON.stringify(result, null, 2).replace(/\n/g, "\n  "));
    return true;
  } catch (error) {
    if (error instanceof ZynlePayError) {
      console.log(`ZynlePayError — ${error.message}`);
      if (error.httpStatus !== undefined) console.log(`  httpStatus: ${error.httpStatus}`);
      if (error.responseBody !== undefined)
        console.log(
          "  responseBody:",
          JSON.stringify(error.responseBody, null, 2).replace(/\n/g, "\n  "),
        );
    } else {
      console.log(`unexpected error — ${(error as Error).message}`);
    }
    return false;
  }
}

let failures = 0;

failures += (await run("checkBalance", () => client.checkBalance())) ? 0 : 1;

failures += (await run("paymentStatus (non-existent reference)", () =>
  client.paymentStatus({ referenceNo: "SMOKE-NONEXISTENT-000" }),
))
  ? 0
  : 1;

if (process.env.SMOKE_INCLUDE_PAYMENTS === "1") {
  const referenceNo = `SMOKE-${Date.now()}`;
  console.log(`\nIncluding payment operations (base referenceNo: ${referenceNo}).`);
  failures += (await run("momoDeposit (1 unit)", () =>
    client.momoDeposit({ senderId: msisdn, referenceNo, amount: 1 }),
  ))
    ? 0
    : 1;

  failures += (await run(`paymentStatus (${referenceNo})`, () =>
    client.paymentStatus({ referenceNo }),
  ))
    ? 0
    : 1;

  failures += (await run("momoWithdraw (1 unit)", () =>
    client.momoWithdraw({ receiverId: msisdn, referenceNo: `${referenceNo}-W`, amount: 1 }),
  ))
    ? 0
    : 1;

  failures += (await run("walletToBank (1 unit)", () =>
    client.walletToBank({
      receiverId: process.env.ZYNLEPAY_SMOKE_BANK_ACCOUNT ?? "62123456789",
      bankName: process.env.ZYNLEPAY_SMOKE_BANK_NAME ?? "fnb",
      referenceNo: `${referenceNo}-B`,
      amount: 1,
      description: "smoke test",
    }),
  ))
    ? 0
    : 1;

  failures += (await run("cardDeposit (1 unit)", () =>
    client.cardDeposit({
      referenceNo: `${referenceNo}-C`,
      amount: 1,
      description: "smoke test",
      firstName: "Smoke",
      lastName: "Test",
      address: "1 Test Rd",
      email: "smoke@example.com",
      phone: msisdn,
      city: "Lusaka",
      state: "Lusaka",
      currency: "ZMW",
      zipCode: "10101",
      country: "ZMB",
    }),
  ))
    ? 0
    : 1;
} else {
  console.log(
    "\nSkipping money-moving operations. Set SMOKE_INCLUDE_PAYMENTS=1 to include a 1-unit momo deposit.",
  );
}

console.log(
  failures === 0 ? "\nSmoke test passed." : `\nSmoke test finished with ${failures} failure(s).`,
);
process.exit(failures === 0 ? 0 : 1);
