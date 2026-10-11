# ui-balance

Agent skills for finishing a web app and keeping its code and history in shape.
The frontend skills walk the running app, measure what they see, and fix drift
from your own design tokens, shared components and written conventions — without
imposing a palette or a layout system, and without changing product behavior.
The convention skills carry a backend architecture and a commit format from
project to project.

| Skill | Use it for |
| --- | --- |
| [`ui-balance`](skills/ui-balance/SKILL.md) | A visual-consistency pass: typography, colors, spacing, component sizes and interaction states across pages, dialogs, lists, chats and comments. |
| [`polish-page`](skills/polish-page/SKILL.md) | Finishing one page, or a short list of them, until it is dense, complete and ready to market. |
| [`polish-app`](skills/polish-app/SKILL.md) | The app-wide version of polish-page: inventory every screen, fix cross-page drift in the shared layer, then polish page by page. |
| [`fsd-styled-components`](skills/fsd-styled-components/SKILL.md) | Feature-Sliced Design placement, public exports, styled-components and data-attribute variant conventions for building or reviewing components. |
| [`api-backend`](skills/api-backend/SKILL.md) | Layered conventions for a Node/TypeScript API on routing-controllers, Inversify and TypeORM: controllers, managers, repositories, entities, DTOs, DI wiring, exceptions and tests. |
| [`semantic-commits`](skills/semantic-commits/SKILL.md) | Conventional Commits with fixed types, package scopes, one change per commit, breaking-change footers, branch and PR naming, and a header check. |

The polish skills and ui-balance apply `fsd-styled-components` when a project
uses Feature-Sliced Design or styled-components, and follow the project's own
conventions otherwise; the polish skills commit with `semantic-commits` when the
repository uses Conventional Commits.

## What they do

### ui-balance

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

### polish-page

Takes one or more URLs or app paths and gives each page a full pass: capture it
at 1440 and 390 before any change, inventory its blocks, then apply nine layout
rules (each fact shown once, related content in one card, equal panel heights,
a compact header, joined action pills, dense rhythm, rows aligned across
columns), reuse the shared components instead of local clones, add the missing
states (skeleton, retryable error, empty, guest gate), the page head and
restrained motion, and verify with measurements at four widths. With several
pages it captures the set first, fixes what they share once, and keeps their
measurements in agreement.

### polish-app

Inventories every screen and format (tabs, steps, dialogs and their phone
drawers, guest and signed-in views), builds a contact sheet, audits eleven
cross-page concerns (columns, headers, blocks, one look per domain object,
states, page heads, copy, control sizes, motion, navigation, domain rules),
sweeps the source for raw colors, native controls, hard-coded paths and local
clones, then works in rounds: shared fixes first, then pages in the order a new
visitor meets them. It stops after the audit for you to confirm the order.

### fsd-styled-components

Where code goes (layers, slices, segments, barrels and import direction), how
state, multi-step actions and API errors are owned, how styled components are
named, ordered and extended, and how variants are expressed as typed `data-*`
attributes or native/ARIA state. Includes a reference with a styling example, an
action pattern (with an optional [Effect](https://effect.website) variant) and a
feature spec template.

### api-backend

A controller → `*Manager` service → repository → entity layering, with one firm
rule: no helper functions at module scope — a helper with one caller is a
`private` method on that class, a shared stateless one a `static` method on a
utility class, one with collaborators an injectable service (framework plumbing
excepted). It covers Inversify tokens and where to bind them, why controllers
resolve from the container instead of `@inject`, TypeORM entities with
serialization groups, DTOs, exceptions, error middleware, role checks, OpenAPI
composition, tests, and a step-by-step checklist for a new endpoint. It applies to
backends on that stack; a project's own base classes and decorator names win.

### semantic-commits

`type(scope): subject` headers of at most 72 characters, eleven types with a rule
for each (visual CSS is `feat`/`fix`, never `style`), scopes taken from the
repository's packages, one logical change per commit (split by hunk when a file
mixes concerns, each commit building on its own), `!` plus a `BREAKING CHANGE:`
footer for anything a consumer has to act on, `<type>/<topic>` branches and PR
titles, a two-line check over the branch's headers, and safe ways to fix a header
before it is pushed. It applies where the repository already uses Conventional
Commits or you ask for them, and follows the repository's own convention
otherwise.

The frontend skills need a runnable local dev server (demo or mock data
preferred) and, except fsd-styled-components, a browser the agent can drive
(Claude in Chrome, a built-in browser pane, or a Playwright MCP server).

## Install

### Claude Code (plugin)

```bash
claude plugin marketplace add YOUR_GH_USER/ui-balance
```

```bash
claude plugin install ui-balance@ivan-skills
```

Or inside a session: `/plugin marketplace add YOUR_GH_USER/ui-balance`, then
`/plugin install ui-balance@ivan-skills`. The skills are invoked as
`/ui-balance:<skill>` — `/ui-balance:ui-balance`, `/ui-balance:polish-page`,
`/ui-balance:polish-app`, `/ui-balance:fsd-styled-components`,
`/ui-balance:api-backend`, `/ui-balance:semantic-commits` — and Claude also picks
them up on its own when a request matches.

The plugin has no `version` field, so every new commit on the default branch is
a new version; `claude plugin update ui-balance@ivan-skills` pulls it.

### Other agents (Codex, Cursor, Copilot, Gemini CLI, …)

```bash
npx skills@latest add YOUR_GH_USER/ui-balance
```

Add `--skill <name>` to install only some of them, `-a <agent>` to pick the
agent, and `-g` to install for your user rather than the project. Installed this
way into Claude Code, a skill is invoked by its own name (`/ui-balance`,
`/polish-page`); in Codex, as `$ui-balance`. The polish skills link to
polish-page, fsd-styled-components and semantic-commits, so install those
alongside them. Use one
install method per agent — installing both the plugin and the `npx skills` copy
into Claude Code gives you every skill twice.

## Usage

```text
/ui-balance:ui-balance
/ui-balance:ui-balance settings, feed, product details
/ui-balance:ui-balance audit only /messages
/ui-balance:polish-page /settings
/ui-balance:polish-page http://localhost:5173/products /products/42 keep the hero
/ui-balance:polish-app
/ui-balance:polish-app checkout, account pages
/ui-balance:api-backend add an endpoint that archives a project
/ui-balance:semantic-commits split the working tree into commits
```

- ui-balance with no arguments covers the whole active app, including its
  dialogs and other overlays; routes, features or components narrow it; `audit
  only` reports findings and evidence without edits.
- polish-page takes URLs or paths in order; any other words are directions.
- polish-app with no arguments covers every page; names or areas limit it.

The frontend skills edit frontend code only, and none of the skills commit unless
you ask.

## Project add-ons

Every project names its route table, tokens and shared components differently.
The skills discover them, but a short add-on file per skill makes a pass faster
and keeps project rules from being guessed. Each skill reads
**`.claude/<skill-name>.md`** (or `.agents/<skill-name>.md`) before it starts,
and what it says overrides the skill's generic discovery and defaults; your
instructions in the request override both.

| File | Typical contents |
| --- | --- |
| `.claude/ui-balance.md` | Route table and app root, tokens, typography, dialog primitive, chat and comment components, type scale, palette rules, run and check commands. |
| `.claude/polish-page.md` | Shared component names (identity row, meta line, badge, stat, delta, empty state, …), the page-columns helper, header and control sizes, head mechanism and title pattern, copy voice, demo sign-in, pitfalls. |
| `.claude/polish-app.md` | Page order, alternate builds, removed features never to restore, domain rules, commit style. polish-app also reads `polish-page.md`. |
| `.claude/fsd-styled-components.md` | Source root and alias, layer and segment set, state library and binding, HTTP client, optimistic/runner helpers, demo fixtures, architecture doc. |
| `.claude/api-backend.md` | Backend package and alias, base repository/entity names, custom decorators, reference implementations, dev/test commands, generated API client. |
| `.claude/semantic-commits.md` | The scope table (scope → path), the base branch for the header check, what counts as a breaking change here, files to split by key. |

An example for ui-balance:

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
  plugin.json                Claude Code plugin manifest
  marketplace.json           single-plugin marketplace "ivan-skills"
skills/
  ui-balance/
    SKILL.md                 the visual-consistency method
    references/
      visual-review.md       criteria for dialogs, lists, chat, comments, color and spacing
      measure-ui.js          read-only browser expression for computed-style snapshots
    agents/openai.yaml       display metadata for Codex
  polish-page/SKILL.md       one page, or a short list, to market-ready
  polish-app/SKILL.md        every page, with the cross-page audit
  fsd-styled-components/
    SKILL.md                 FSD + styled-components conventions
    REFERENCE.md             examples, actions, API errors, spec template
  api-backend/
    SKILL.md                 layers, the no-module-functions rule, naming, endpoint checklist
    REFERENCE.md             per-layer patterns, DI, routing-controllers, config, testing
  semantic-commits/SKILL.md  Conventional Commits rules and the header check
```

When changing a skill's scope, keep its `SKILL.md` description, the manifests'
descriptions and (for ui-balance) `agents/openai.yaml` consistent.

## License

[MIT](LICENSE)
