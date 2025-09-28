<!--
Sync Impact Report
Version change: 2.1.0 → 2.2.0
Modified principles:
	Principle 3: (unchanged wording since 2.1.0, retained for context)
	Principle 6: Removed obsolete test requirement bullets to align with Principle 7 (No Automated Tests)
Added principles: Principle 8 (Formal API Layer via *-api.ts)
Removed sections: None
Templates requiring updates:
	.specify/templates/plan-template.md ⚠ pending (add gate: hooks must call *-api.ts exports, no direct fetch)
	.specify/templates/tasks-template.md ⚠ pending (add tasks for creating *-api.ts before hook implementation)
	.specify/templates/spec-template.md ✅ unchanged (still neutral)
	.specify/templates/agent-file-template.md ⚠ pending (will include API layer once plans reference it)
Follow-up TODOs: Add PR checklist item: "API functions defined in *-api.ts and consumed by hooks only"
-->

# Outgrown Constitution

## Core Principles

### 1. Single Language & Schema Authority (TypeScript + Zod)
All runtime and build-time code MUST be written in TypeScript; no JavaScript source files are allowed.
All domain data shapes (API payloads, entities, forms, persisted records) MUST be defined exactly once as Zod schemas in a dedicated central module (`src/types` or a single `schema.ts` index) which exports both the schema and its inferred TypeScript type. Consumers MUST import inferred types—never duplicate interface/type literals. Any change to a schema MUST trigger: (a) type regeneration (if aggregated), (b) review of affected queries, mutations, and UI forms, and (c) incremental migration notes in the PR.
Rationale: Ensures a single source of truth eliminating drift between validation, runtime contracts, and compile-time types.

### 2. Mobile‑First Progressive Web App with React
All UI work MUST prioritize mobile viewport (≤420px width) first; desktop enhancements are progressive. The application MUST remain installable as a PWA: lighthouse PWA checklist ≥ 90, service worker active, offline shell renders core navigation. Components MUST be functional components using React Hooks; class components are prohibited. Layout and interaction decisions MUST validate tap targets and accessible focus order.
Rationale: Primary user context is mobile; enforcing PWA guarantees resilience and broad device reach.

### 3. Data Access Encapsulation via TanStack Query Hooks (NON‑NEGOTIABLE)
All remote data fetching and mutations MUST use TanStack Query. Each custom hook file MUST expose exactly one query OR one mutation (never both). Hooks MUST be named `use<Domain><Action>` and reside under `src/services/queries/` or `src/services/mutations/`. Raw `fetch` / `axios` (etc.) calls are forbidden outside these hooks. Hooks MUST: (a) validate inputs & responses against the central Zod schemas, (b) provide typed return values, (c) surface errors in a normalized shape, (d) for mutations implement optimistic UI updates with rollback: snapshot previous cache, apply minimal optimistic patch, revert on error, and always invalidate or patch-finalize on success. Optimistic mutation logic MUST be colocated inside the mutation hook via `onMutate`, `onError`, `onSettled` or equivalent composition; components MUST NOT manually orchestrate rollback. Components MUST consume these hooks—no direct query client usage in JSX files except inside the hook implementation itself.
Rationale: Constrains side-effects, creates predictable caching surfaces, enforces data contract integrity, and ensures fast perceived responsiveness with safe rollback guarantees.

### 4. Styling Consistency via Tailwind + Centralized Design Tokens
Tailwind CSS is the sole styling mechanism (no ad‑hoc inline styles except dynamic calculated values). Design tokens (colors, spacing scale, typography, breakpoints) MUST be centralized in Tailwind config and referenced via semantic utility classes (e.g., `text-body`, `bg-surface`). Arbitrary values (e.g., `p-[13px]`) are prohibited unless a PR adds a corresponding token. Shared component variants MUST use composition (e.g., `clsx`/utility functions) rather than duplicating class lists.
Rationale: Enforces visual consistency, reduces cascade complexity, and enables theming & dark mode evolution.

### 5. Internationalization & Content Separation (i18next)
No user‑visible string literals are permitted directly in JSX. All user‑facing text MUST come from i18next resource keys. Interpolated values MUST use i18next interpolation, not manual concatenation. Error messages surfaced from hooks MUST be mapped to translatable keys before display. Adding a new string requires adding its base locale entry in the same PR. Test IDs MUST NOT reuse translation keys to avoid coupling.
Rationale: Guarantees global readiness and prevents hard‑to‑localize string sprawl.

### 6. Deterministic Global State via Redux + redux-persist
Cross-component state that is not strictly cacheable server data MUST reside in a centralized Redux store. Criteria for Redux usage: derived UI or interaction state shared across 2+ distant component branches, preference or session metadata, or optimistic UI coordination across multiple queries. TanStack Query REMAINS the source for server state; duplication of remote data in Redux is forbidden except for derived projections (which MUST recalculate from query selectors). The store MUST:
1. Be typed with RootState & AppDispatch inferred from `configureStore`.
2. Use feature slices under `src/state/<feature>Slice.ts` with createSlice.
3. Provide selector functions exported beside each slice; components MUST use selectors—not direct state tree traversal.
4. Integrate `redux-persist` to persist only whitelisted slices (e.g., auth/session, user preferences) – NEVER persist volatile or large collections already cached by queries.
5. Include a versioned migration strategy (`persistConfig.version`) with migration functions for breaking shape changes.
6. Ensure serialization safety: non-serializable values (Promises, class instances) are disallowed; lint rule must enforce.
7. (Reserved for future automated validation if test framework reintroduced.)
Rationale: Guarantees deterministic state evolution, enables offline continuity for essential session data, and prevents mixing server cache concerns with client orchestration logic. (Testing bullets removed in v2.2.0 to respect No Automated Tests policy.)

### 7. Explicit No Automated Tests Policy (MAJOR Deviation)
### 8. Formal API Layer via *-api.ts Modules
All network-accessing functions (REST, RPC, GraphQL, etc.) MUST be defined in dedicated `*-api.ts` modules (pattern: `src/services/api/<domain>-api.ts`). Each module:
1. Exports pure, side-effect isolated functions that perform the request & return a parsed object (Zod-validated where applicable) or throw a normalized error.
2. Contains no React imports, no TanStack Query usage, and no direct UI concerns.
3. MUST NOT maintain module-level mutable state except stable configuration constants.
4. MUST centralize endpoint paths and request assembly (headers, query params) to ensure a single change point.
5. MUST provide narrow, intention-revealing function names (`fetchChildClothing()`, `updateInventoryItem()`), not generic wrappers.

Query and mutation hooks MUST call ONLY these exported API functions (plus optimistic patch logic for mutations). Direct `fetch`/`axios`/`Request` usage inside hooks or components is forbidden. If an API function evolves (e.g., new field), all consuming Zod schemas and hooks MUST be reviewed in the same PR.
Rationale: Enforces a clean separation between data transport, caching orchestration, and presentation; improves testability (when/if tests return) and minimizes duplicate request logic.
The project intentionally maintains ZERO automated test suites (unit, integration, E2E) at this stage. No test runners, coverage tools, or CI test steps are required. Quality assurance occurs through structured manual review and exploratory testing before merge. Any contribution adding automated tests MUST first pass a governance amendment to reintroduce a testing framework and associated gates. Contributors MUST provide in PR description: (a) critical paths manually exercised, (b) data mutation scenarios validated, (c) i18n key presence check performed, and (d) Lighthouse & basic runtime error console scan. Hotfix PRs MUST include steps to reproduce + manual verification steps post-fix.
Rationale: Optimizes for rapid iteration at early product stage; defers automation investment until feature set stabilizes. Risks (regression, unnoticed edge cases) are accepted explicitly by maintainers.

## Technology & Architectural Constraints

1. Language: TypeScript only; failing CI if `.js` (non-generated) is introduced.
2. Validation & Types: Zod schemas co-located in a single exported registry (`src/types/index.ts`). Re-exports only; no redefinition in feature folders.
3. Directory Canon:
	- `src/components/` presentational & composite UI (no data fetching).
	- `src/services/queries|mutations/` data hooks.
	- `src/types/` schemas & inferred types.
	- `src/i18n/` localization resources & config.
4. State: React Query cache preferred; avoid global state libs unless (a) cache cannot express requirement, (b) documented in PR with alternative analysis.
5. Accessibility: All interactive components MUST have discernible text or `aria-label` sourced from i18n keys.
6. Performance: Each new route lighthouse performance ≥ 80 mobile; regressions over 5 points require remediation task before merge.
7. Bundles: Dynamic import for feature views > 20KB gzipped.
8. Error Boundaries: At least one root error boundary plus domain boundaries around data-heavy areas.
9. Manual QA Checkpoints (replaces automated tests): Each PR description MUST list manual verification steps executed (happy path, error path, mobile viewport, translation key resolution). Breakage found post-merge triggers a retro documenting why it escaped manual review.
10. Naming: Hook files = `use*.ts`; schema files = `*.schema.ts` or aggregated exports; translation keys kebab-case grouped by domain.

## Development Workflow & Quality Gates

Pipeline Gates (PR cannot merge if failing):
1. Type Integrity: `tsc --noEmit` passes; any `any` introduced MUST be justified with a `// TODO(type): reason` and linked issue.
2. Lint & Style: ESLint + Tailwind class ordering plugin passes; no unused schemas.
3. i18n Enforcement: Script/ESLint rule fails build if string literals (matching regex of 3+ alphabetic chars) appear in JSX children.
4. Hook Boundary: Lint rule ensures TanStack Query calls only inside `src/services/queries|mutations`.
5. Schema Drift: If a response shape changes, migration note included in PR description.
6. PWA Compliance: `manifest.json` & service worker present; CI job runs a smoke Lighthouse PWA audit.
7. Manual QA Report: PR description contains executed verification checklist (happy path, failure path, mobile viewport, offline shell, translation presence, console error scan).

PR Review Checklist MUST include: schema addition? hook isolation? no raw strings? tailwind tokens? mobile viewport render? translation keys added? manual QA steps present & credible? If any item fails → request changes.

Release Steps:
1. Bump app version (semver) if user-facing or schema changes.
2. Generate CHANGELOG entry referencing schema & state migrations (no test section expected).
3. Run Lighthouse & bundle analyzer snapshot; attach diff.

## Governance

Authority: This Constitution supersedes ad-hoc conventions. Conflicts resolved in favor of the latest amended version.

Amendments:
1. Open a PR titled `constitution: proposal <summary>`.
2. Include: (a) proposed text diff, (b) rationale, (c) migration impact, (d) version bump type justification.
3. Require ≥1 maintainer approval (or 2 if a Principle is added/removed or materially redefined).

Versioning (this document):
* MAJOR: Remove or redefine a Core Principle; alter non-negotiable constraints.
* MINOR: Add a new Principle, expand sections with new mandatory gates.
* PATCH: Editorial clarity, wording, examples—no rule change.

Compliance Reviews:
* Quarterly audit: sample 5 recent PRs for adherence—log violations & remediation tasks (focus on manual QA thoroughness, missed regressions).
* Pre-merge automation: lint suite enforces objective rules (hook/file location, raw text detection, forbidden JS, schema duplication).

Deviation Process:
* Temporary exception requires an issue labeled `constitution-deviation` with: scope, duration, rollback plan.
* Exceptions auto-expire in one release cycle.

Sunsetting / Replacement:
* When replacing a library (e.g., Zod), create a migration RFC; dual-run allowed only during transition branch.

**Version**: 2.1.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28
**Version**: 2.2.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28