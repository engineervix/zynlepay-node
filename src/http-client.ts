import { createRequire } from "node:module";

/**
 * Error thrown for any failed ZynlePay API call: network failures, non-2xx
 * HTTP responses, malformed response bodies, and request timeouts.
 */
export class ZynlePayError extends Error {
  /**
   * The HTTP status code returned by the API, when a response was received.
   * `undefined` for network failures and timeouts.
   */
  readonly httpStatus?: number;

  /**
   * The parsed response body returned by the API, when available. Useful for
   * API-level error codes and messages.
   */
  readonly responseBody?: unknown;

  constructor(
    message: string,
    options: { httpStatus?: number; responseBody?: unknown; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ZynlePayError";
    if (options.httpStatus !== undefined) this.httpStatus = options.httpStatus;
    if (options.responseBody !== undefined) this.responseBody = options.responseBody;
  }
}

// tsdown shims `import.meta.url` in CJS output automatically, so
// createRequire(import.meta.url) works in both dist/index.cjs and
// dist/index.mjs. scripts/verify-dist.mjs (run as part of `npm run build`)
// is the regression check for this working end to end.
const { version } = createRequire(import.meta.url)("../package.json") as { version: string };

// Lets ZynlePay identify the SDK, version, and Node runtime from their
// request logs — useful for their support/debugging and for gauging
// adoption of a given release. Intentionally not user-configurable.
const USER_AGENT = `zynlepay-node/${version} (Node.js ${process.version})`;

/** A `fetch`-compatible function. */
export type FetchFn = typeof fetch;

/**
 * Options for {@link HttpClient}.
 */
export interface HttpClientOptions {
  /** The fetch implementation to use. Defaults to the global `fetch`. */
  fetchFn?: FetchFn;
  /**
   * Request timeout in milliseconds.
   * @defaultValue 30000
   */
  timeoutMs?: number;
}

/**
 * Minimal JSON-over-HTTP POST client. Internal seam between the SDK and the
 * network; inject `fetchFn` in tests to avoid real network calls.
 */
export class HttpClient {
  private readonly fetchFn: FetchFn;
  private readonly timeoutMs: number;

  constructor(options: HttpClientOptions = {}) {
    this.fetchFn = options.fetchFn ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  /**
   * POST a JSON body to `url` and parse the JSON response.
   *
   * @param url - The absolute URL to POST to.
   * @param body - The request body; serialized with `JSON.stringify`.
   * @returns The parsed JSON response body.
   * @throws {ZynlePayError} On network failure, timeout, non-2xx status, or a
   *   response body that is not valid JSON.
   */
  async post<T = unknown>(url: string, body: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        throw new ZynlePayError(`ZynlePay request timed out after ${this.timeoutMs}ms: ${url}`, {
          cause,
        });
      }
      throw new ZynlePayError(`ZynlePay network request failed: ${url}`, { cause });
    } finally {
      clearTimeout(timer);
    }

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (cause) {
      throw new ZynlePayError(`ZynlePay returned a non-JSON response (HTTP ${response.status})`, {
        httpStatus: response.status,
        cause,
      });
    }

    if (!response.ok) {
      throw new ZynlePayError(`ZynlePay API error (HTTP ${response.status})`, {
        httpStatus: response.status,
        responseBody: parsed,
      });
    }

    return parsed as T;
  }
}
