# Rules for app/api/**

- Webhook handlers MUST verify signatures before processing any payload
- Use `supabaseAdmin` (service role) — no user session exists in webhook/API contexts
- All Route Handlers must return proper HTTP status codes and JSON responses
- Handle duplicate webhook deliveries gracefully (idempotency)
- Never hardcode API keys — use `process.env` for all secrets
- Webhook routes go in `app/api/webhooks/[service]/route.ts`
- Public API routes go in `app/api/v1/[resource]/route.ts`
- Always include error handling for external service failures (network, rate limits, API errors)
