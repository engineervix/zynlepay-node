import { HttpClient } from "./http-client.js";
import type { FetchFn } from "./http-client.js";
import { assertApiSuccess } from "./callback.js";
import type {
  BalanceResponse,
  CardDepositRequest,
  CardDepositResponse,
  MomoDepositRequest,
  MomoDepositResponse,
  MomoWithdrawRequest,
  MomoWithdrawResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
  WalletToBankRequest,
  WalletToBankResponse,
} from "./types.js";

export { HttpClient, ZynlePayError } from "./http-client.js";
export type { FetchFn, HttpClientOptions } from "./http-client.js";
export { parseCallback } from "./callback.js";
export type { ZynlePayCallback } from "./callback.js";
export type {
  BalanceResponse,
  CardDepositRequest,
  CardDepositResponse,
  MomoDepositRequest,
  MomoDepositResponse,
  MomoWithdrawRequest,
  MomoWithdrawResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
  WalletToBankRequest,
  WalletToBankResponse,
} from "./types.js";

/**
 * Configuration required to construct a {@link ZynlePayClient}.
 */
export interface ZynlePayConfig {
  /** Merchant identifier issued by ZynlePay (e.g. `MEC00002`). */
  merchantId: string;
  /** API identifier issued by ZynlePay. */
  apiId: string;
  /** Secret API key issued by ZynlePay. */
  apiKey: string;
  /**
   * Which ZynlePay environment to call.
   * @defaultValue `"sandbox"`
   */
  environment?: "sandbox" | "production";
  /**
   * Fetch implementation to use for HTTP requests. Defaults to the global
   * `fetch`. Inject a stub in tests.
   */
  fetchFn?: FetchFn;
  /**
   * Request timeout in milliseconds.
   * @defaultValue 30000
   */
  timeoutMs?: number;
}

/**
 * Resolved endpoint URLs for a ZynlePay environment.
 */
export interface BaseUrls {
  /** URL used by all payment operations. */
  api: string;
  /** URL used only by the payment-status operation. */
  paymentStatus: string;
}

const URLS: Record<"sandbox" | "production", BaseUrls> = {
  sandbox: {
    api: "https://sandbox.zynlepay.com/zynlepay/jsonapi",
    paymentStatus: "https://sandbox.zynlepay.com/zynlepay/jsonapi/paymentstatus",
  },
  production: {
    api: "https://payments.zynlepay.com/zynlepay/jsonapi",
    paymentStatus: "https://payments.zynlepay.com/zynlepay/paymentstatus",
  },
};

/**
 * Resolve the endpoint URLs for a ZynlePay environment.
 *
 * @param environment - `"sandbox"` or `"production"`.
 * @returns The API and payment-status base URLs for that environment.
 *
 * @example
 * const urls = resolveBaseUrls("sandbox");
 * // urls.api === "https://sandbox.zynlepay.com/zynlepay/jsonapi"
 */
export function resolveBaseUrls(environment: "sandbox" | "production"): BaseUrls {
  return URLS[environment];
}

function assertPresent(value: string, name: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`ZynlePayClient: config field "${name}" is required`);
  }
}

/**
 * Client for the ZynlePay payments API.
 *
 * Construct one client per set of merchant credentials and reuse it across
 * requests.
 *
 * @example
 * const client = new ZynlePayClient({
 *   merchantId: process.env.ZYNLEPAY_MERCHANT_ID!,
 *   apiId: process.env.ZYNLEPAY_API_ID!,
 *   apiKey: process.env.ZYNLEPAY_API_KEY!,
 *   environment: "sandbox",
 * });
 */
export class ZynlePayClient {
  private readonly config: Required<Omit<ZynlePayConfig, "fetchFn" | "timeoutMs">> &
    Pick<ZynlePayConfig, "fetchFn" | "timeoutMs">;
  private readonly http: HttpClient;
  private readonly urls: BaseUrls;

  constructor(config: ZynlePayConfig) {
    assertPresent(config.merchantId, "merchantId");
    assertPresent(config.apiId, "apiId");
    assertPresent(config.apiKey, "apiKey");
    this.config = {
      ...config,
      environment: config.environment ?? "sandbox",
    };
    this.urls = resolveBaseUrls(this.config.environment);
    this.http = new HttpClient({
      ...(config.fetchFn !== undefined ? { fetchFn: config.fetchFn } : {}),
      ...(config.timeoutMs !== undefined ? { timeoutMs: config.timeoutMs } : {}),
    });
  }

  /** The environment this client is bound to. */
  get environment(): "sandbox" | "production" {
    return this.config.environment;
  }

  /**
   * The auth envelope included in every API request.
   *
   * @param channel - The ZynlePay channel for the operation.
   */
  private auth(channel: string): Record<string, string> {
    return {
      merchant_id: this.config.merchantId,
      api_id: this.config.apiId,
      api_key: this.config.apiKey,
      channel,
    };
  }

  /**
   * POST to the API and raise on API-level failures reported with a 2xx
   * status.
   */
  private async send<T>(url: string, body: unknown): Promise<T> {
    const result = await this.http.post<T>(url, body);
    assertApiSuccess(result);
    return result;
  }

  /**
   * Collect funds from a customer's mobile money wallet (momo deposit).
   *
   * The API responds immediately; the customer authorizes via a USSD prompt
   * on their phone, and the final status is delivered to your callback URL.
   *
   * The response reports outcome via `response_code` / `response_description`
   * (not a `status` field). A non-success response code arrives as a normal
   * HTTP 200 response, not as an exception — inspect `response_code` to
   * determine the outcome.
   *
   * @param request - The deposit details.
   * @returns The parsed API response.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.momoDeposit({
   *   senderId: "260971234567",
   *   referenceNo: "ORDER-1001",
   *   amount: 100,
   * });
   * console.log(result.response_code, result.response_description);
   */
  async momoDeposit(request: MomoDepositRequest): Promise<MomoDepositResponse> {
    return this.send<MomoDepositResponse>(this.urls.api, {
      auth: this.auth("momo"),
      data: {
        method: "runBillPayment",
        sender_id: request.senderId,
        reference_no: request.referenceNo,
        amount: String(request.amount),
      },
    });
  }

  /**
   * Send funds to a customer's mobile money wallet (momo withdraw).
   *
   * The final transaction status is delivered to your callback URL.
   *
   * @param request - The withdrawal details.
   * @returns The parsed API response.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.momoWithdraw({
   *   receiverId: "260971234567",
   *   referenceNo: "PAYOUT-1001",
   *   amount: 250,
   * });
   */
  async momoWithdraw(request: MomoWithdrawRequest): Promise<MomoWithdrawResponse> {
    return this.send<MomoWithdrawResponse>(this.urls.api, {
      auth: this.auth("momo"),
      data: {
        method: "runPayToEwallet",
        receiver_id: request.receiverId,
        reference_no: request.referenceNo,
        amount: String(request.amount),
      },
    });
  }

  /**
   * Send funds from the ZynlePay disbursement wallet to a bank account.
   *
   * The final transaction status is delivered to your callback URL. The
   * immediate response reports outcome via `response_code` /
   * `response_description` — `"120"` indicates success.
   *
   * @param request - The transfer details.
   * @returns The parsed API response.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.walletToBank({
   *   receiverId: "62123456789",
   *   bankName: "fnb",
   *   referenceNo: "PAYOUT-1002",
   *   amount: 10,
   *   description: "Invoice 55 payout",
   * });
   * console.log(result.response_code, result.response_description);
   */
  async walletToBank(request: WalletToBankRequest): Promise<WalletToBankResponse> {
    return this.send<WalletToBankResponse>(this.urls.api, {
      auth: this.auth("bank"),
      data: {
        method: "runPayToBank",
        reference_no: request.referenceNo,
        amount: String(request.amount),
        description: request.description,
        bank_name: request.bankName,
        receiver_id: request.receiverId,
      },
    });
  }

  /**
   * Collect funds from a customer's bank card.
   *
   * The response contains a `redirectUrl` pointing to the bank's checkout
   * page — redirect the cardholder there (browser or webview) to enter their
   * card details and complete bank verification (OTP). The final status is
   * delivered to your callback URL.
   *
   * @param request - The deposit and cardholder billing details.
   * @returns The parsed API response, including the checkout `redirectUrl`.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.cardDeposit({
   *   referenceNo: "ORDER-1003",
   *   amount: 1,
   *   description: "Order 1003",
   *   firstName: "Jane",
   *   lastName: "Banda",
   *   address: "1 Cairo Rd",
   *   email: "jane@example.com",
   *   phone: "260971234567",
   *   city: "Lusaka",
   *   state: "Lusaka",
   *   currency: "ZMW",
   *   zipCode: "10101",
   *   country: "ZMB",
   * });
   * // Send the customer to result.redirectUrl to complete payment.
   */
  async cardDeposit(request: CardDepositRequest): Promise<CardDepositResponse> {
    const raw = await this.send<Record<string, unknown>>(this.urls.api, {
      auth: this.auth("card"),
      data: {
        method: "runTranAuthCapture",
        reference_no: request.referenceNo,
        amount: String(request.amount),
        description: request.description,
        first_name: request.firstName,
        last_name: request.lastName,
        address: request.address,
        email: request.email,
        phone: request.phone,
        city: request.city,
        state: request.state,
        currency: request.currency,
        zip_code: request.zipCode,
        country: request.country,
      },
    });

    const response: CardDepositResponse = { ...raw };
    if (typeof raw["redirect_url"] === "string") {
      response.redirectUrl = raw["redirect_url"];
    }
    return response;
  }

  /**
   * Look up the current status of a transaction by reference number.
   *
   * Note: ZynlePay hosts this operation on a different URL path than the
   * other operations; the client handles that automatically.
   *
   * When the API cannot determine the status yet, it responds with
   * `response_code: "990"` and a message asking you to retry after 60
   * seconds — this is a normal response, not an error.
   *
   * @param request - The reference number to look up.
   * @returns The parsed API response with the transaction status.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.paymentStatus({ referenceNo: "ORDER-1001" });
   * console.log(result.response_code); // "100" success, "990" pending, "995" failed
   */
  async paymentStatus(request: PaymentStatusRequest): Promise<PaymentStatusResponse> {
    return this.send<PaymentStatusResponse>(this.urls.paymentStatus, {
      api_id: this.config.apiId,
      api_key: this.config.apiKey,
      reference_no: request.referenceNo,
    });
  }

  /**
   * Check the balance of the merchant's ZynlePay wallet.
   *
   * @returns The parsed API response with the wallet balance.
   * @throws {ZynlePayError} On network failure, timeout, or an API error.
   *
   * @example
   * const result = await client.checkBalance();
   * console.log(result.disbursement_balance, result.collection_balance);
   */
  async checkBalance(): Promise<BalanceResponse> {
    return this.send<BalanceResponse>(this.urls.api, {
      auth: {
        merchant_id: this.config.merchantId,
        api_id: this.config.apiId,
        api_key: this.config.apiKey,
      },
      data: { method: "checkBalance" },
    });
  }
}
