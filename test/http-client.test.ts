import { describe, expect, it, vi } from "vitest";
import { HttpClient, ZynlePayError } from "../src/index.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("HttpClient", () => {
  it("POSTs a JSON body with JSON headers", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const http = new HttpClient({ fetchFn });

    await http.post("https://example.test/api", { hello: "world" });

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.test/api");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": expect.stringMatching(/^zynlepay-node\//) as string,
    });
    expect(JSON.parse(init.body as string)).toEqual({ hello: "world" });
  });

  it("sends a User-Agent header identifying the SDK and Node version", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const http = new HttpClient({ fetchFn });

    await http.post("https://example.test/api", {});

    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    const escapedNodeVersion = process.version.replace(/\./g, "\\.");
    expect(headers["User-Agent"]).toMatch(
      new RegExp(`^zynlepay-node/\\S+ \\(Node\\.js ${escapedNodeVersion}\\)$`),
    );
  });

  it("parses and returns the JSON response body", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, { id: 42 }));
    const http = new HttpClient({ fetchFn });

    const result = await http.post<{ id: number }>("https://example.test/api", {});
    expect(result).toEqual({ id: 42 });
  });

  it("throws ZynlePayError on a non-2xx HTTP status, including the parsed body", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(jsonResponse(400, { message: "bad request", code: "E_400" }));
    const http = new HttpClient({ fetchFn });

    const error = await http.post("https://example.test/api", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ZynlePayError);
    const zerr = error as ZynlePayError;
    expect(zerr.httpStatus).toBe(400);
    expect(zerr.responseBody).toEqual({ message: "bad request", code: "E_400" });
  });

  it("throws ZynlePayError when the network request itself fails", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const http = new HttpClient({ fetchFn });

    const error = await http.post("https://example.test/api", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ZynlePayError);
    expect((error as ZynlePayError).message).toMatch(/network/i);
  });

  it("throws ZynlePayError when the response body is not valid JSON", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    );
    const http = new HttpClient({ fetchFn });

    const error = await http.post("https://example.test/api", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ZynlePayError);
    expect((error as ZynlePayError).message).toMatch(/JSON/i);
  });

  it("aborts the request after the configured timeout", async () => {
    const fetchFn = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const http = new HttpClient({ fetchFn, timeoutMs: 10 });

    const error = await http.post("https://example.test/api", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ZynlePayError);
    expect((error as ZynlePayError).message).toMatch(/timed out/i);
  });
});
