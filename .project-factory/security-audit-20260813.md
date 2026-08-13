# 2026-08-13 Maintenance Security Audit

## Scope

- Homepage asset replacement and optimisation.
- Administrator product-image upload and product-save path.
- Production runtime dependency check.

## Fixed in this release

| Severity | Finding | Resolution | Evidence |
|---|---|---|---|
| High | The product editor stored image files as browser `data:` URLs. Those values exceed the product API limit and caused valid saves to fail. | Files are now sent to the authenticated upload endpoint before the product record is saved. The stored value is the returned upload URL. | `ProductEditorForm` regression test. |
| Medium | SVG uploads were accepted even though an SVG can carry active browser content. | SVG is no longer an accepted product-image type. | Upload route review. |
| Medium | MIME type alone was trusted for an upload. | JPEG, PNG and WebP binary signatures are checked server-side before storage. | API integration tests. |
| Medium | Product image fields could receive arbitrary `data:` content. | Product validation now accepts only same-site absolute paths or HTTP(S) URLs, and requires at least one image. | API validation review. |
| High | React Router had a published CSRF advisory. | Runtime lockfile updated from 7.18.1 to 7.18.2. | `npm audit --omit=dev --audit-level=high` reports zero production vulnerabilities. |

## Checks passed

- 39 unit and integration tests passed.
- TypeScript, API TypeScript, ESLint and production build passed.
- Product-upload endpoint is covered for both valid PNG content and forged PNG MIME type.
- ADMIN session remains HttpOnly and cannot call OWNER-only routes.
- Cross-origin mutation remains blocked by the API integration test.
- All five homepage images are local, compressed assets; four supporting cards contain no embedded source text or frames.

## Non-blocking operational follow-up

| Priority | Item | Required action |
|---|---|---|
| P2 | Railway local upload storage is not durable across a replacement container. | Before relying on frequent admin image uploads, attach a Railway Volume or configure R2 / OSS / COS object storage. Bundled homepage assets in this release are unaffected. |
| P3 | Development-only dependency audit still reports transitive tooling advisories. | It does not affect the production Docker image because development dependencies are omitted. Review again during the next tooling upgrade. |

## Release decision

Approved for the current Railway release. The storage follow-up does not block the homepage change or the repaired product-save workflow, but it must be completed before treating Railway local uploads as long-term media storage.
