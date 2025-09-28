# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → identify required query/mutation hooks
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Core: schemas, state slices, query/mutation hooks, UI components
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Manual QA verification after core implementation
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Ensure TypeScript + Vite project structure per plan (verify no stray .js sources)
- [ ] T002 Add/Update central Zod schema exports in `src/types/index.ts`
- [ ] T003 [P] Configure ESLint (incl. rules: no raw JSX strings, hook location) & Prettier
- [ ] T004 [P] Tailwind token additions (if feature requires new design tokens)
- [ ] T005 Initialize/extend i18n resource keys for feature domain in `src/i18n/<feature>.json`
- [ ] T006 Configure Redux store (`src/state/store.ts`) with middleware & `redux-persist` base config
- [ ] T007 [P] Add root persist config (whitelist slices) & version constant with migration scaffold

## Phase 3.2: Data & State Foundations
- [ ] T008 [P] Define/extend Zod schema(s) & export in `src/types/index.ts`
- [ ] T009 [P] Create query hook skeleton(s) in `src/services/queries/`
- [ ] T010 [P] Create mutation hook skeleton(s) in `src/services/mutations/`
- [ ] T011 [P] Create Redux slice `src/state/<feature>Slice.ts` (initial state, reducers, selectors)
- [ ] T012 Add slice to store & persist whitelist (update version if needed)
- [ ] T013 Add i18n keys for UI states (empty, loading, error)
 - [ ] T014 [P] Create API module `src/services/api/<feature>-api.ts` with exported function stubs

## Phase 3.3: Core Implementation
- [ ] T015 [P] Implement API functions in `<feature>-api.ts` (request assembly, response parsing, error normalization)
- [ ] T016 [P] Flesh out query hook logic calling API functions (schema parse, error mapping)
- [ ] T017 [P] Flesh out mutation hook logic calling API functions (optimistic cache update + snapshot & rollback + finalize/invalidate)
- [ ] T018 [P] Implement slice reducers & memoized selectors
- [ ] T019 Integrate hooks + selectors into feature UI components (no direct fetch calls)
- [ ] T020 Add loading, empty, and error UI states (translated)
- [ ] T021 Ensure responsive layout & Tailwind token usage

## Phase 3.4: Integration
- [ ] T022 Wire service worker offline fallback for new route(s)
- [ ] T023 Add query invalidation paths on successful mutations
- [ ] T024 Add error boundary coverage (or extend existing) for feature area
- [ ] T025 Performance check: Lighthouse (mobile) ≥ 80 & no >5pt regression
- [ ] T026 Validate persisted state migrations (simulate old version load)

## Phase 3.5: Manual QA & Polish
- [ ] T027 [P] Manual QA: primary happy path (document steps in PR)
- [ ] T028 [P] Manual QA: error path & offline fallback
- [ ] T029 [P] Manual QA: mobile viewport & responsive layout check
- [ ] T030 [P] Verify translation key coverage (no raw strings)
- [ ] T031 Refactor duplicated Tailwind utility chains into helper(s)
- [ ] T032 [P] Add translation keys to secondary locales (if enabled)
- [ ] T033 Update CHANGELOG with schema + i18n + state migration notes + API layer summary
- [ ] T034 Manual a11y audit (focus order, aria labels)
- [ ] T035 Verify selector memoization (profiling if necessary)

## Dependencies
- Setup (T001-T007) precedes Data & State (T008-T014)
- API module (T014) required before hook implementation (T016-T017)
- Data & State (T008-T014) before Core Implementation (T015-T021)
- Core Implementation (T015-T021) before Integration (T022-T026)
- Integration (T022-T026) before Manual QA & Polish (T027-T035)

## Parallel Example
```
# Launch representative parallel setup tasks:
Task: "Tailwind token additions" (T004)
Task: "Configure Redux store" (T006)
Task: "Persist config scaffold" (T007)
```

## Notes
- [P] tasks = different files, no dependencies
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → query or mutation hook task
   - Each endpoint → hook + UI usage task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → manual QA scenario task [P]
   - Quickstart scenarios → additional manual verification steps

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts mapped to hook tasks
- [ ] All entities have schema/state slice tasks
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task
- [ ] Manual QA tasks cover happy, error, offline, mobile, i18n, a11y