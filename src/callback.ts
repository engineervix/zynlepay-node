import { ZynlePayError } from "./http-client.js";

/**
 * A validated ZynlePay callback payload.
 *
 * ZynlePay delivers the final status of every transaction to the callback URL
 * you configure in your merchant settings. ZynlePay does not publish a schema
 * for these payloads, so known fields are typed and the full raw payload is
 * preserved on {@link ZynlePayCallback.raw}.
 */
export interface ZynlePayCallback {
  /** The reference number you assigned to the transaction. */
  referenceNo: string;
  /** The raw `response_code` from the callback payload (e.g. `"100"`, `"995"`). */
  responseCode: string;
  /**
   * Normalized outcome derived from {@link ZynlePayCallback.responseCode} -
   * `"success"` for `"100"`, `"failed"` for everything else. There is no
   * `status` field in real ZynlePay callback payloads to read this from
   * directly; unrecognized codes are treated as failed rather than guessed
   * as successful.
   */
  status: "success" | "failed";
  /** The full, unmodified callback payload. */
  raw: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate and normalize a callback payload received from ZynlePay.
 *
 * Parse the JSON body of the incoming webhook request and pass it here. The
 * function checks for the two fields every callback must carry —
 * `reference_no` and `response_code` — and returns a camelCase view (plus a
 * normalized `status`) while keeping the raw payload intact for any
 * additional fields.
 *
 * @param payload - The parsed JSON body of the callback request.
 * @returns The validated callback.
 * @throws {Error} If the payload is not an object or is missing required fields.
 *
 * @example
 * // Express
 * app.post("/zynlepay/callback", (req, res) => {
 *   const callback = parseCallback(req.body);
 *   await updateOrder(callback.referenceNo, callback.status);
 *   res.sendStatus(200);
 * });
 */
export function parseCallback(payload: unknown): ZynlePayCallback {
  if (!isRecord(payload)) {
    throw new Error("ZynlePay callback payload must be a JSON object");
  }
  if (typeof payload["reference_no"] !== "string" || payload["reference_no"] === "") {
    throw new Error('ZynlePay callback payload is missing required field "reference_no"');
  }
  if (typeof payload["response_code"] !== "string" || payload["response_code"] === "") {
    throw new Error('ZynlePay callback payload is missing required field "response_code"');
  }
  return {
    referenceNo: payload["reference_no"],
    responseCode: payload["response_code"],
    status: payload["response_code"] === "100" ? "success" : "failed",
    raw: payload,
  };
}

const FAILURE_STATUSES = new Set(["error", "failed", "failure"]);

/**
 * Raise a {@link ZynlePayError} when a 2xx response body reports an
 * API-level failure. The ZynlePay docs do not define error responses; this
 * treats a top-level `status` of `error`/`failed`/`failure` as a failure and
 * surfaces the API's `message` when present.
 *
 * @param body - The parsed response body.
 * @throws {ZynlePayError} When the body reports a failure status.
 */
export function assertApiSuccess(body: unknown): void {
  if (!isRecord(body)) return;
  const status = body["status"];
  if (typeof status !== "string" || !FAILURE_STATUSES.has(status.toLowerCase())) return;

  const message = typeof body["message"] === "string" ? body["message"] : undefined;
  throw new ZynlePayError(`ZynlePay API reported failure: ${message ?? status}`, {
    responseBody: body,
  });
}
