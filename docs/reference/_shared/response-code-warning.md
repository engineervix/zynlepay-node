::: warning Check `response_code`, not exceptions
This endpoint reports outcome via `response_code` / `response_description`,
**not** a `status` field. A non-success response code arrives as a normal
HTTP 200 response, not as an exception — inspect `response_code` to
determine the outcome. Transport-level failures (non-2xx HTTP, network
errors, timeouts) still throw `ZynlePayError` — see
[Error handling](/guide/errors).
:::
