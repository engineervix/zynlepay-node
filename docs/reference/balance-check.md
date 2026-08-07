# Balance check

Check the balances of your merchant ZynlePay wallets.

## Example

```ts
const result = await client.checkBalance();
console.log(result.disbursement_balance); // payout wallet
console.log(result.collection_balance); // collection wallet
```

## Response

The response preserves all raw API fields. Notable fields:

- `disbursement_balance` — balance of the disbursement (payout) wallet.
- `collection_balance` — balance of the collection (receiving) wallet.

This operation is idempotent and safe to retry. Throws `ZynlePayError` on
failure — see [Error handling](/guide/errors).
