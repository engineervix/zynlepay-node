/**
 * Request for {@link ZynlePayClient.momoDeposit}.
 */
export interface MomoDepositRequest {
  /** Mobile money account number sending the funds (MSISDN, e.g. `260971234567`). */
  senderId: string;
  /** Your unique reference for the transaction. */
  referenceNo: string;
  /** Amount to collect. Serialized as a string, per the ZynlePay API. */
  amount: number;
}

/**
 * Fields common to momo deposit, momo withdraw, and card deposit responses.
 *
 * These operations share the same wire shape. Known fields are typed from
 * observed sandbox responses; any additional fields are preserved on the
 * object.
 *
 * Note on status reporting: these responses report outcome via
 * `response_code` / `response_description`, not a `status` field. A
 * non-success `response_code` (for example the sandbox's `"2000"` —
 * "No active simulator for the phone number provided") arrives as a normal
 * HTTP 200 response, not as an exception. Inspect `response_code` to
 * determine the outcome.
 */
export interface ZynlePayOperationResponse {
  /** API response code (e.g. `"2000"` from the sandbox simulator). */
  response_code?: string;
  /** Human-readable description of the response code. */
  response_description?: string;
  /** Echo of your reference number. */
  reference_no?: string;
  /** Echo of the phone number the operation was requested for. */
  phone?: string;
  /** User-defined field 1, echoed back by the API. */
  udf1?: string;
  /** User-defined field 2, echoed back by the API. */
  udf2?: string;
  /** User-defined field 3, echoed back by the API. */
  udf3?: string;
  /** User-defined field 4, echoed back by the API. */
  udf4?: string;
  /** User-defined field 5, echoed back by the API. */
  udf5?: string;
  /** Any additional fields returned by the API. */
  [key: string]: unknown;
}

/**
 * Raw response returned by the ZynlePay momo deposit endpoint.
 */
export type MomoDepositResponse = ZynlePayOperationResponse;

/**
 * Internal wire payload for the momo deposit operation.
 */
export interface MomoDepositPayload {
  method: "runBillPayment";
  sender_id: string;
  reference_no: string;
  amount: string;
}

/**
 * Request for {@link ZynlePayClient.momoWithdraw}.
 */
export interface MomoWithdrawRequest {
  /** Mobile money account number receiving the funds (MSISDN, e.g. `260971234567`). */
  receiverId: string;
  /** Your unique reference for the transaction. */
  referenceNo: string;
  /** Amount to send. Serialized as a string, per the ZynlePay API. */
  amount: number;
}

/** Raw response returned by the ZynlePay momo withdraw endpoint. */
export type MomoWithdrawResponse = ZynlePayOperationResponse;

/**
 * Request for {@link ZynlePayClient.walletToBank}.
 */
export interface WalletToBankRequest {
  /** Bank account number receiving the funds. */
  receiverId: string;
  /** Bank name as expected by the API (e.g. `"fnb"`). */
  bankName: string;
  /** Your unique reference for the transaction. */
  referenceNo: string;
  /** Amount to send. Serialized as a string, per the ZynlePay API. */
  amount: number;
  /** Description of the transfer. */
  description: string;
}

/** Raw response returned by the ZynlePay wallet-to-bank endpoint. */
export interface WalletToBankResponse {
  /** API response code. `"120"` indicates success. */
  response_code?: string;
  /** Human-readable description of the response code (e.g. `"Successful"`). */
  response_description?: string;
  /** Operator's own reference number for the payout. */
  operatorreference?: number;
  /** Echo of your reference number. */
  reference_no?: string;
  /** Name on the receiving account, when provided by the API. */
  accountname?: string;
  /** Birthday on the receiving account, when provided by the API. */
  birthday?: string;
  /** ISO currency code of the transfer (e.g. `ZMW`). */
  currency?: string;
  /** Transfer date as reported by the API. */
  date?: string;
  /** Merchant callback URL registered for this payout, when present. */
  merchant_callback_url?: string;
  /** Transfer amount as reported by the API. */
  amount?: string;
  /** Echo of the receiving account number. */
  receiver_id?: string;
  /** Operator identifier, when present. */
  operator?: string;
  /** Transfer timestamp as reported by the API. */
  transaction_date?: string;
  /** Notification type for the payout (e.g. `"new"`). */
  notification_type?: string;
  /** Any additional fields returned by the API. */
  [key: string]: unknown;
}

/**
 * Request for {@link ZynlePayClient.cardDeposit}.
 */
export interface CardDepositRequest {
  /** Your unique reference for the transaction. */
  referenceNo: string;
  /** Amount to charge. Serialized as a string, per the ZynlePay API. */
  amount: number;
  /** Description of the transaction. */
  description: string;
  /** Cardholder first name. */
  firstName: string;
  /** Cardholder last name. */
  lastName: string;
  /** Cardholder billing address. */
  address: string;
  /** Cardholder email address. */
  email: string;
  /** Cardholder phone number. */
  phone: string;
  /** Cardholder city. */
  city: string;
  /** Cardholder state or province. */
  state: string;
  /** ISO currency code (e.g. `ZMW` for Zambian Kwacha). */
  currency: string;
  /** Cardholder postal code. */
  zipCode: string;
  /** ISO 3166-1 alpha-3 country code (e.g. `ZMB` for Zambia). */
  country: string;
}

/**
 * Response returned by the ZynlePay card deposit endpoint.
 *
 * The raw API fields are preserved; {@link CardDepositResponse.redirectUrl}
 * is a camelCase convenience accessor for `redirect_url`, the bank checkout
 * page you must send the cardholder to.
 */
export interface CardDepositResponse extends ZynlePayOperationResponse {
  /**
   * URL of the bank checkout page. Redirect the cardholder here (browser or
   * webview) to complete the payment.
   */
  redirectUrl?: string;
}

/**
 * Request for {@link ZynlePayClient.paymentStatus}.
 */
export interface PaymentStatusRequest {
  /** The reference number of the transaction to look up. */
  referenceNo: string;
}

/** Raw response returned by the ZynlePay payment-status endpoint. */
export interface PaymentStatusResponse {
  /**
   * API response code — the field to branch on. Confirmed against a live
   * sandbox: `"100"` success, `"990"` indeterminate (retry after 60s, see
   * `message`), `"995"` failed.
   */
  response_code?: string;
  /** Echo of your reference number. */
  reference_no?: string;
  /** Human-readable API message, e.g. retry guidance for code `990`. */
  message?: string;
  /**
   * Transaction status, if the API includes one. Documented by ZynlePay but
   * never observed in a live sandbox response (`"100"`, `"990"`, and `"995"`
   * responses all carried `response_code`/`message` only, no `status` field
   * at all). Don't rely on this being present; branch on `response_code`
   * instead.
   */
  status?: string;
  /** Any additional fields returned by the API. */
  [key: string]: unknown;
}

/** Raw response returned by the ZynlePay balance endpoint. */
export interface BalanceResponse {
  /** Balance of the disbursement (payout) wallet. */
  disbursement_balance?: string;
  /** Balance of the collection (receiving) wallet. */
  collection_balance?: string;
  /** Any additional fields returned by the API. */
  [key: string]: unknown;
}
