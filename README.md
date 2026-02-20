<div align="center">

# Rewrite Docs

**The official docs for Rewrite API, SDKs, Webhooks, CLI, and Serverless workflows.**

From first request to production-grade messaging: fast onboarding, clear reference, and practical implementation patterns.

[Live Docs](https://docs.rewritetoday.com) • [API](https://docs.rewritetoday.com/en/api/introduction) • [Pricing](https://rewritetoday.com/pricing) • [Dashboard](https://dashboard.rewritetoday.com)


## Project structure

</div>

```text
.
├─ docs.json                  # Mintlify config (tabs, nav groups, OpenAPI wiring)
├─ en/                        # English docs pages
├─ pt-br/                     # Portuguese docs pages
├─ en/api/openapi*.json       # API reference split by feature
├─ pt-br/api/openapi.json     # PT-BR OpenAPI mirror
├─ snippets/                  # Reusable snippets
└─ style.css                  # Global docs styles
```

---

<div align="center">

## Run locally

### 1. Install dependencies

</div>

```bash
bun install
```

<div align="center">

### 2. Start docs preview

</div>

```bash
mintlify dev
```

<div align="center">

### 3. Validate OpenAPI files

</div>

```bash
mintlify openapi-check en/api/openapi.json
mintlify openapi-check pt-br/api/openapi.json
```

<div align="center">

### 4. Format/check docs files

</div>

```bash
bun run biome:check
```

<div align="center">

Want to improve Rewrite docs? Open a PR and help us ship a better developer experience.

</div>
