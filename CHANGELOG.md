# Changelog

## v0.2.0 — Purpose-first UX update (2026-07-04)

### Added

- Purpose-based home screen with three routes:
  - **はじめる**: 3-minute diagnostic and a recommended first lesson
  - **仕事に使う**: topic search, next-number guide, hypothesis list, and copy-ready analysis templates
  - **弱点をつぶす**: weakness map based on correctness, confidence, and error tags
- 6-question diagnostic for finance foundations, P/L, cash flow, B/S, reasoning, and comparisons.
- Practical topic cards for operating margin, operating cash flow, inventory, and competitor comparison.
- Post-question recovery path: users can open the relevant lesson or switch to another question from feedback.
- Navigation items for the three usage routes.

### Storage

- The new diagnostic and work-search state is saved locally with the existing learning log.
- Existing local data is migrated automatically by merging new defaults with saved data.

### Validation

- `node --check data.js`
- `node --check app.js`
- Headless runtime smoke test for first render
