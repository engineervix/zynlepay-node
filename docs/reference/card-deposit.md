# Card deposit

Collect funds from a customer's bank card.

## Flow

1. Call `cardDeposit` with the transaction and cardholder billing details.
2. The response contains a `redirectUrl` — send the customer to this bank
   checkout page (browser redirect or webview).
3. The customer enters card details and completes bank verification (OTP).
4. ZynlePay delivers the final status to your callback URL. See
   [Handling callbacks](/guide/callbacks).

## Example

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

res.redirect(result.redirectUrl!);
```

## Parameters

| Field         | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| `referenceNo` | string | Your unique transaction reference.            |
| `amount`      | number | Amount to charge (e.g. ZMW).                  |
| `description` | string | Description of the transaction.               |
| `firstName`   | string | Cardholder first name.                        |
| `lastName`    | string | Cardholder last name.                         |
| `address`     | string | Cardholder billing address.                   |
| `email`       | string | Cardholder email address.                     |
| `phone`       | string | Cardholder phone number.                      |
| `city`        | string | Cardholder city.                              |
| `state`       | string | Cardholder state or province.                 |
| `currency`    | string | ISO currency code (e.g. `ZMW`).               |
| `zipCode`     | string | Cardholder postal code.                       |
| `country`     | string | ISO 3166-1 alpha-3 country code (e.g. `ZMB`). |

## Response

The response preserves all raw API fields. Notable fields:

- `response_code` — API response code indicating the outcome.
- `response_description` — human-readable description of the outcome.
- `reference_no` — echo of your reference number.
- `phone` — echo of the cardholder phone number.
- `udf1`–`udf5` — user-defined fields echoed back by the API.
- `redirectUrl` — camelCase accessor for the bank checkout URL.

Card deposit responses report outcome via `response_code` /
`response_description`, **not** a `status` field. A non-success response code
(for example the sandbox's `"2000"` — "No active simulator for the phone
number provided") arrives as a normal HTTP 200 response, not as an exception.
Inspect `response_code` to determine the outcome. Transport-level failures
(non-2xx HTTP, network errors, timeouts) still throw `ZynlePayError` — see
[Error handling](/guide/errors).
