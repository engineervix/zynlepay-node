/**
 * Regression check for the built package: confirms dist/index.cjs (via
 * require) and dist/index.mjs (via import) both load and construct a client
 * without crashing. Unit tests run against source through vitest's own
 * transform and never execute these files, so this is the only thing that
 * would catch an ESM/CJS interop bug in the actual build output — e.g.
 * src/http-client.ts's createRequire(import.meta.url) call, which depends on
 * tsdown's built-in import.meta shimming in CJS output.
 *
 * Run automatically as part of `npm run build`.
 */
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);

const cjs = require("../dist/index.cjs");
assert.ok(new cjs.ZynlePayClient({ merchantId: "x", apiId: "y", apiKey: "z" }));
console.log("dist/index.cjs: OK");

const esm = await import("../dist/index.mjs");
assert.ok(new esm.ZynlePayClient({ merchantId: "x", apiId: "y", apiKey: "z" }));
console.log("dist/index.mjs: OK");
