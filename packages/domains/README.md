<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/domains/assets/younndai-domains-icon-ondark.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YounndAI/yon/main/packages/domains/assets/younndai-domains-icon-onlight.png" />
    <img alt="YounndAI Domains" src="https://raw.githubusercontent.com/YounndAI/yon/main/packages/domains/assets/younndai-domains-icon-onlight.png" width="80" />
  </picture>
</p>

<p align="center">
  <strong>@younndai/domains</strong><br />
  Fetch, validate, introspect, and classify YounndAI Domain schemas<br />
  <em>Part of the YON™ toolchain — data, intent, and instructions in a single stream.</em>
</p>

<p align="center">
  <a href="https://domains.younndai.com">Domain Registry</a> · <a href="https://github.com/YounndAI/yon-spec">Specification</a> · <a href="./LICENSE">Apache 2.0</a> · <a href="./TRADEMARK.md">Trademark Policy</a> · <a href="https://github.com/YounndAI/brand">Brand Assets</a>
</p>

[![npm](https://img.shields.io/npm/v/@younndai/domains)](https://www.npmjs.com/package/@younndai/domains)
[![license](https://img.shields.io/npm/l/@younndai/domains)](./LICENSE)

## What is this?

YounndAI Domains define **industry-specific vocabularies** — structured schemas that specify what data a domain contains, what fields each record requires, and how values should be validated. Think of it as "JSON Schema for industry concepts."

This package gives you:

- **34 official domains bundled** — health, fintech, logistics, HR, legal, and more
- **Zero-config validation** — validate any JS object against domain rules
- **JSON Schema export** — convert domains to JSON Schema draft-07 for any ecosystem
- **Universal** — works in Node.js, Deno, Bun, browsers, and edge runtimes

## Install

```bash
npm install @younndai/domains
```

## Quick Start

```ts
import {
  resolveDomain,
  validateRecord,
  getBundledDomain,
} from "@younndai/domains";

// ── Resolve a domain (bundled → local → remote) ──
const health = await resolveDomain("yai.health");
console.log(health?.records); // { VITALS: {...}, DX: {...}, RX: {...}, ... }

// ── Validate data against a domain record ──
const result = await validateRecord("yai.fintech", "TXN", {
  id: "txn-001",
  amount: 1500.5,
  currency: "USD",
});

if (!result.valid) {
  result.errors.forEach((e) => console.error(`${e.field}: ${e.message}`));
}

// ── Access bundled domains (zero network) ──
const fintech = getBundledDomain("yai.fintech");
console.log(fintech?.records.TXN.fields);
```

## JSON Schema Export

Convert any domain record to industry-standard JSON Schema draft-07:

```ts
import {
  recordToJSONSchema,
  exportJSONSchemas,
} from "@younndai/domains/json-schema";
import { getBundledDomain } from "@younndai/domains";

// Single record → JSON Schema
const fintech = getBundledDomain("yai.fintech")!;
const schema = recordToJSONSchema(fintech.records.TXN, "TXN", "yai.fintech");
// → { $schema: 'http://json-schema.org/draft-07/schema#', ... }

// Entire domain → all record schemas
const schemas = await exportJSONSchemas("yai.health");
```

## Schema Introspection

Explore domain structure programmatically:

```ts
import {
  getRecordTags,
  describeRecord,
  findDomainsByTag,
} from "@younndai/domains";

// List all tags in a domain
const tags = await getRecordTags("yai.health");
// → ['VITALS', 'DX', 'RX', 'LAB', ...]

// Describe a record
const summary = await describeRecord("yai.health", "VITALS");
// → { tag: 'VITALS', requiredFields: ['bp'], optionalFields: ['hr', ...], ... }

// Reverse lookup: find all domains that define a tag
const results = findDomainsByTag("POSITION");
// → { tag: 'POSITION', matches: [
//     { domainId: 'yai.hr', record: {...} },
//     { domainId: 'yai.fintech', record: {...} },
//   ] }
```

## Taxonomy & Classification

Classify domains by tier, conformance, trust, and freshness:

```ts
import {
  resolveSetType,
  resolveConformanceLevel,
  resolveTrustLevel,
  getFreshnessLabel,
} from "@younndai/domains/taxonomy";

resolveSetType("yai.health", "official");
// → 'official'

resolveConformanceLevel(0.95);
// → { key: 'gold', label: 'Gold', colorKey: 'conformance-gold', ... }

resolveTrustLevel(true, 0.95, "official");
// → 'trusted'

getFreshnessLabel("2026-02-01");
// → { label: 'Updated 27d ago', colorKey: 'freshness-recent' }
```

## Configuration

```ts
import { configureClient, setRegistryUrl } from "@younndai/domains";

// Change registry URL (default: https://domains.younndai.com)
setRegistryUrl("https://domains-staging.younndai.com");

// Full configuration
configureClient({
  registryUrl: "https://domains.younndai.com",
  timeout: 5000,
  onWarn: (msg) => logger.warn(msg),
});
```

## Subpath Exports

| Export                          | Description             |
| ------------------------------- | ----------------------- |
| `@younndai/domains`             | Main entry — everything |
| `@younndai/domains/taxonomy`    | Classification engine   |
| `@younndai/domains/json-schema` | JSON Schema conversion  |

> **Spec vs SDK:** This package implements the normative [YON Domain Schema Format](https://yai.younndai.com) and extends it with SDK-specific features: taxonomy classification, JSON Schema export, offline bundles, sync introspection, and reverse tag lookup. These extensions do not modify the normative schema format.

## API Surface

### Core

- `resolveDomain(id)` — Unified T1→T3→T2 resolution
- `getBundledDomain(id)` / `listBundledDomains()` / `isBundledDomain(id)`
- `loadDomainFromJSON(json)` — Convert raw JSON to `DomainSchema`

### Registry Client (10 methods)

- `getDomain(id)` / `getDomains(ids[])` / `fetchDomainList(opts?)`
- `searchDomains(query)` / `getDomainVersions(id)` / `getRegistryStats()`
- `listNamespaces(opts?)` / `getNamespace(path)`
- `getNotices(opts?)` / `getAnnouncements(opts?)`
- `checkRegistryHealth()`
- `configureClient(opts)` / `setRegistryUrl(url)` / `getRegistryUrl()`
- `setCacheAdapter(adapter)` / `clearDomainCache()` / `getDomainCacheStats()` / `resetCacheStats()`

### Local Registry

- `registerDomain(schema)` / `unregisterDomain(id)`
- `listDomains(filter?)` / `getDomainTags(domains[])`
- `getLocalDomain(id)` / `isOfficialDomain(id)`

### Validation

- `validateRecord(domainId, tag, data)` — async
- `validateRecordSync(tag, data, domain)` — sync
- `validateRecords(entries[])` — batch
- `validateFields(data, constraints)` — low-level

### Introspection

- `getRecordTags(id)` / `getRecordSchema(id, tag)`
- `getRequiredFields(id, tag)` / `getOptionalFields(id, tag)`
- `getFieldConstraints(id, tag, field?)` / `describeRecord(id, tag)`
- All have `*Sync` variants

### Lookup

- `findDomainsByTag(tag)` / `buildTagIndex()`

### Offline

- `downloadRegistryBundle(opts?)` / `serializeBundle(bundle)` / `deserializeBundle(json)`
- `applyBundle(bundle, registerFn)` / `getBundleManifest(bundle)`

## Documentation

- **API examples** — see the Quick Start, JSON Schema, Introspection, Taxonomy, and Configuration sections above; [`TESTING.md`](./TESTING.md) covers the test suite.
- **Domain registry** — [domains.younndai.com](https://domains.younndai.com) (API: `https://domains.younndai.com/api/domains`).
- **Changelog** — [`CHANGELOG.md`](./CHANGELOG.md).

## The YON Project

YON is an open block format and toolchain.

- **Specification** — [`@younndai/yon-spec`](https://github.com/YounndAI/yon-spec) — the normative YON v2.0 standard.
- **Toolchain** — [`YounndAI/yon`](https://github.com/YounndAI/yon) — parser, generator, runner, converter, examples, benchmarks, domains, ai-relay.
- **Editor support** — [`yon-vscode`](https://github.com/YounndAI/yon-vscode) (VS Code Marketplace) · [`@younndai/yon-textmate`](https://github.com/YounndAI/yon-textmate) (TextMate grammar).

## Testing

Run the Vitest suite with `npm test`. See [`TESTING.md`](./TESTING.md) for coverage details.

---

## About YounndAI

**YounndAI™ — You and AI, unified.** (pronounced *"yoon-dye"*)

A philosophy of intelligence: building with intention, so humans and machines
think together without losing what makes either whole.

## License & Attribution

Apache-2.0. © 2026 MARLINK TRADING SRL (YounndAI). See [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).

"YON" and "YounndAI" are trademarks of MARLINK TRADING SRL — see [`TRADEMARK.md`](./TRADEMARK.md).

Created by [Alexandru Mareș](https://allemaar.com).

Website: [yon.younndai.com](https://yon.younndai.com)

<p align="center"><em>Structure before scale. Harmony above all.</em></p>

---

|               |                                                         |
| ------------- | ------------------------------------------------------- |
| **Spec**      | [YON v2.0](https://yon.younndai.com)                    |
| **Author**    | [Alexandru Mareș](https://allemaar.com)                 |
| **Company**   | [MARLINK TRADING SRL](https://younndai.com) · YounndAI™ |
| **License**   | [Apache 2.0](./LICENSE) — © 2026 MARLINK TRADING SRL    |
| **Trademark** | [YounndAI™ Trademark Guidelines](./TRADEMARK.md)        |
