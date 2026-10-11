# ui-balance

An agent skill that gives a web app's frontend a finishing pass: it walks the
running app page by page, opens the dialogs, drawers, lists, chats and comment
threads the routes hide, and balances what it finds — typography, colors,
spacing, component sizes, alignment and interaction states — while keeping the
product's behavior and design.

It is a method, not a style. It reads your design tokens, shared components and
written conventions and corrects drift from them; it does not impose a palette
or a layout system.

## What it does

- **Builds an inventory** from the route table and the app root, then traces the
  overlays and shell surfaces (sidebar, mobile drawer, global chat, inline
  comments) that have no route of their own.
- **Keeps a coverage ledger**: one row per route, feature, state and viewport, with
  a status (`pending`, `verified`, `fixed and verified`, `source-only`, `blocked`)
  and evidence.
- **Reviews five dimensions together** on every surface: typography, color,
  spacing, geometry and density, and visual states (hover, focus, selected,
  disabled, busy, error, empty).
- **Measures, not guesses**: baseline screenshots at 1440×900 and 390×844 (plus
  1280 and 1920 for shell changes), and an optional read-only browser snapshot
  ([`measure-ui.js`](skills/ui-balance/references/measure-ui.js)) of computed
  fonts, paint, borders, boxes, gaps and scroll geometry.
- **Stops at consequential actions**: it inspects trade, purchase, payment,
  deletion and publishing flows up to the final step, and never sends a message,
  submits a form for real or changes user data to reach a state.
- **Fixes shared causes first** (tokens, shared components, the shell), then local
  exceptions, rechecks every consumer it touched, re-runs the project's typecheck,
  lint and build, and reports before/after measurements and screenshots.
- **Finishes** only when every inventoried surface has a final status for every
  applicable dimension — not after normalizing font sizes.

It needs a runnable local dev server (demo or mock data preferred) and a browser
the agent can drive (Claude in Chrome, a built-in browser pane, or a Playwright
MCP server).

## Install

### Claude Code (plugin)

```bash
claude plugin marketplace add YOUR_GH_USER/ui-balance
```

```bash
claude plugin install ui-balance@ivan-skills
```

Or inside a session: `/plugin marketplace add YOUR_GH_USER/ui-balance`, then
`/plugin install ui-balance@ivan-skills`. The skill is invoked as
`/ui-balance:ui-balance`, and Claude also picks it up on its own when you ask for
a UI balance or visual-consistency pass.

The plugin has no `version` field, so every new commit on the default branch is
a new version; `claude plugin update ui-balance@ivan-skills` pulls it.

### Other agents (Codex, Cursor, Copilot, Gemini CLI, …)

```bash
npx skills@latest add YOUR_GH_USER/ui-balance
```

Add `-a <agent>` to pick the agent, `-g` to install for your user rather than the
project. Installed this way into Claude Code, it is invoked as `/ui-balance`; in
Codex, as `$ui-balance`. Use one install method per agent — installing both the
plugin and the `npx skills` copy into Claude Code gives you the skill twice.

## Usage

```text
/ui-balance:ui-balance
/ui-balance:ui-balance settings, feed, product details
/ui-balance:ui-balance dialogs, chat, comments
/ui-balance:ui-balance audit only /messages
```

- No arguments — the whole active app, including its dialogs and other overlays.
- Routes, features or components — narrows the scope to those and the surfaces
  they open.
- `audit only` — findings, a coverage ledger and baseline evidence, no edits.

The skill edits frontend styling and layout only, works through fixes without
pausing for approval of the audit, and commits only when you ask.

## Project add-on

Every project names its route table, tokens and shared components differently.
The skill discovers them, but a short add-on file makes the pass faster and
keeps project rules from being guessed. Put it at **`.claude/ui-balance.md`**
(or `.agents/ui-balance.md`) in your repository; the skill reads it before it
starts, and what it says overrides the skill's generic discovery and fallbacks.
Your instructions in the request override both.

A useful add-on is short and specific:

```markdown
# ui-balance: project add-on

## Paths
- Route table: src/router.tsx; app root (shell, providers, global overlays): src/App.tsx
- Design tokens: src/theme/tokens.ts (emitted as CSS custom properties on :root)
- Typography: src/ui/text.tsx (`Text` roles); control sizes: src/ui/button/model.ts
- Dialog primitive: src/ui/dialog; global chat: src/features/chat (mounted in src/shell/sidebar.tsx)
- Comments: src/features/comments; action bar: src/ui/action-bar

## Conventions
- Follow docs/styling.md (styled-components, variants as data-* attributes).
- Type scale: 24 / 18 / 16 / 14 / 12px. Spacing: 4px steps.
- Brand green is a fill only; small text uses --text-accent.

## Run and check
- Dev server with mock data: pnpm dev (http://localhost:5173)
- Checks: pnpm typecheck && pnpm lint && pnpm build
- Storybook: pnpm storybook

## Boundaries
- Never complete the checkout flow; stop at the review step.
```

## Layout

```text
.claude-plugin/
  plugin.json          Claude Code plugin manifest
  marketplace.json     single-plugin marketplace "ivan-skills"
skills/ui-balance/
  SKILL.md             the method
  references/
    visual-review.md   criteria for dialogs, lists, chat, comments, color and spacing
    measure-ui.js      read-only browser expression for computed-style snapshots
  agents/openai.yaml   display metadata for Codex
```

When changing the skill's scope, keep `SKILL.md`'s description, the manifests'
descriptions and `agents/openai.yaml` consistent.

## License

[MIT](LICENSE)
