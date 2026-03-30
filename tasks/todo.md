# T5: Cleanup ticketing repo residue and reliability blockers

## Current State
- Blocker register flags missing `docs/screenshots/`, dead starter assets in `src/assets/`, and placeholder proof wording in `README.md`.
- README still contains placeholder screenshot language that should be tightened into final-proof wording.
- Current repo tree does not show a `src/assets/` directory, so the dead-asset check needs to be confirmed against the actual working tree before any deletion.

## Plan

### Phase 1: Confirm actual residue
- [ ] 1. Re-check the working tree for dead starter/template files and confirm whether any unused asset files still exist.

### Phase 2: Minimal cleanup
- [ ] 2. Remove any confirmed dead starter assets with the smallest possible change set.
- [ ] 3. Create an empty `docs/screenshots/` directory for later screenshot capture work.

### Phase 3: README proof polish
- [ ] 4. Rewrite the screenshots section so it reads like final proof, not placeholder instructions.
- [ ] 5. Tighten any nearby README wording needed so the repo reads like a finished support-console proof piece.

### Phase 4: Verification and review
- [ ] 6. Run diagnostics for changed files and fix any issues.
- [ ] 7. Run `npm test` and `npm run build` and only stop once verification is clean.
- [ ] 8. Add a review section summarizing the cleanup, README polish, and verification results.

## Review
- Confirmed the earlier `src/assets/` blocker is stale in the current working tree; there is no `src/assets/` directory left to clean.
- Removed the actual unused template residue still present in the repo: `public/icons.svg`.
- Created `docs/screenshots/` so the later screenshot task has the expected target directory.
- Tightened `README.md` so the screenshots section reads like final repo proof instead of placeholder instructions, while keeping the planned screenshot paths intact.
- Verification: `lsp_diagnostics` clean for `.ts` and `.tsx` files in `src/`; `npm test` passes with 18/18 tests; `npm run build` passes.
