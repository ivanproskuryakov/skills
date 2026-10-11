# ui-tools

Agent skills for finishing a web app and keeping its code and history in shape.

The frontend skills walk the running app, measure what they see, and fix drift
from your own design tokens, shared components and written conventions — without
imposing a palette or a layout system, and without changing product behavior.
The convention skills carry a component architecture, a backend architecture and
a commit format from project to project.

| Skill | Use it for |
| --- | --- |
| [`ui-balance`](skills/ui-balance/SKILL.md) | A visual-consistency pass: typography, colors, spacing, component sizes and interaction states across pages, dialogs, lists, chats and comments. |
| [`polish-page`](skills/polish-page/SKILL.md) | Finishing one page, or a short list of them, until it is dense, complete and ready to market. |
| [`polish-app`](skills/polish-app/SKILL.md) | The app-wide version of polish-page: inventory every screen, fix cross-page drift in the shared layer, then polish page by page. |
| [`fsd-styled-components`](skills/fsd-styled-components/SKILL.md) | Feature-Sliced Design placement, public exports, styled-components and data-attribute variant conventions for building or reviewing components. |
| [`api-backend`](skills/api-backend/SKILL.md) | Layered conventions for a Node/TypeScript API on routing-controllers, Inversify and TypeORM. |
| [`semantic-commits`](skills/semantic-commits/SKILL.md) | Conventional Commits: fixed types, package scopes, one change per commit, breaking-change footers, branch and PR names, and a header check. |

The skills work alone and link to each other where they overlap: ui-balance and
the polish skills apply `fsd-styled-components` when a project uses Feature-Sliced
Design or styled-components, polish-app runs polish-page on every page, and the
polish skills commit with `semantic-commits` when the repository uses
Conventional Commits.

## Requirements

- **ui-balance, polish-page, polish-app:** a local dev server the agent can start
  (demo or mock data preferred), and a browser it can drive — Claude in Chrome, a
  built-in browser pane, or a Playwright MCP server.
- **fsd-styled-components:** a React frontend organized by Feature-Sliced Design
  and/or styled with styled-components.
- **api-backend:** a Node/TypeScript backend on routing-controllers, Inversify and
  TypeORM.
- **semantic-commits:** git. It applies where the repository already uses
  Conventional Commits or you ask for them, and defers to the repository's own
  convention otherwise.

## Install

### Claude Code (plugin)

```bash
claude plugin marketplace add ivanproskuryakov/skills
```

```bash
claude plugin install ui-tools@ivanproskuryakov
```

Or inside a session: `/plugin marketplace add ivanproskuryakov/skills`, then
`/plugin install ui-tools@ivanproskuryakov`.

Each skill is invoked as `/ui-tools:<skill>`, and Claude also loads one on its
own when a request matches its description. The six descriptions add about 550
tokens to every session; a skill's full instructions load only when it is used.

Releases are versioned: a new release raises `version` in
`.claude-plugin/plugin.json`. To update, run the following and restart Claude
Code:

```bash
claude plugin update ui-tools@ivanproskuryakov
```

To remove it: `claude plugin uninstall ui-tools@ivanproskuryakov`.

### Other agents (Codex, Cursor, Copilot, Gemini CLI, …)

```bash
npx skills@latest add ivanproskuryakov/skills
```

- `--skill <name>` installs only the named skills; `-a <agent>` picks the agent;
  `-g` installs for your user instead of the current project.
- Installed this way, a skill is invoked by its own name: `/polish-page` in Claude
  Code, `$polish-page` in Codex.
- The skills link to each other (see above), so install the whole set unless you
  only want one of the convention skills.
- `npx skills update` pulls new commits; `npx skills remove <name>` removes one.

Use one install method per agent: the plugin and an `npx skills` copy together
give Claude Code every skill twice.

## Usage

The examples use the plugin's `/ui-tools:` namespace. A skill installed with
`npx skills` has no namespace: `/ui-balance`, `/polish-page`.

```text
/ui-tools:ui-balance
/ui-tools:ui-balance settings, feed, product details
/ui-tools:ui-balance audit only /messages
/ui-tools:polish-page /settings
/ui-tools:polish-page http://localhost:5173/products /products/42 keep the hero
/ui-tools:polish-app
/ui-tools:polish-app checkout, account pages
/ui-tools:fsd-styled-components review features/checkout
/ui-tools:api-backend add an endpoint that archives a project
/ui-tools:semantic-commits split the working tree into commits
```

- **ui-balance** with no arguments covers the whole active app, including its
  dialogs and other overlays. Routes, features or components narrow it, and
  `audit only` reports findings and evidence without edits.
- **polish-page** takes URLs or paths, in order; any other words are directions
  for the pass. Without a page it asks for one.
- **polish-app** with no arguments covers every page; names or areas limit it. It
  stops after the audit for you to confirm the order, unless you ask it to go
  straight through.
- **fsd-styled-components, api-backend and semantic-commits** usually load on
  their own while Claude builds components, changes the backend or commits.
  Invoke them directly to review existing code or history against the rules.

The frontend skills edit frontend code only. None of the skills commit unless
you ask.

## The skills

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

- **Captures first**: each page full length at 1440×900 and 390×844 before any
  change, then an inventory of its blocks — repeated facts, unfinished controls,
  raw colors or spacing, local clones of shared components, missing states.
- **Applies nine layout rules**, among them: show each fact once, group related
  content in one card, give adjacent panels equal heights, keep the header
  compact, join related actions into pills, align paired rows across columns to
  the pixel, and keep a dense rhythm.
- **Finishes the page**: shared components instead of local copies, the missing
  states (skeleton, retryable error, empty, guest gate), the page head (title,
  description, image, Open Graph type), and restrained motion. It adds promotional
  content only where real data backs it.
- **Verifies** at 1280, 1440, 1920 and 390 wide with measurements rather than by
  eye, and exercises the page's interactions up to any consequential final step.
- **With several pages**, it captures the whole set first, fixes what they share
  once, and keeps their title sizes, bar heights and column positions in
  agreement.

### polish-app

- **Inventories every screen and format**: tabs, steps, dialogs and their phone
  drawers, guest and signed-in views, alternate builds. Every format gets a ledger
  row and a capture at both widths, and the captures go on one contact sheet,
  where drift between pages shows.
- **Audits eleven cross-page concerns**: columns, headers, blocks, one look per
  domain object, states, page heads, copy, control sizes, motion, navigation and
  domain rules.
- **Sweeps the source** for raw colors, native controls outside the shared layer,
  hard-coded paths, hand-written heads and scrollbars, stray motion and local
  clones of shared components.
- **Works in rounds**: shared fixes first, rechecking every page that uses them,
  then one polish-page pass per page in the order a new visitor meets them.
- **Verifies across the app** with one measuring script over every route, plus
  page heads, console, network, navigation and the sign-in gate.

### fsd-styled-components

- **Placement**: layers (app, pages, widgets, features, entities, shared), slices,
  segments, barrels and import direction.
- **Ownership**: application state lives in a state segment, never in components;
  multi-step flows live in actions with a handlers contract; API clients and
  loaders each own their failures.
- **Styling**: how styled components are named, ordered and extended, and how
  variants are expressed as typed `data-*` attributes or native/ARIA state.
- **Reference**: a styling example, the action pattern (with an optional
  [Effect](https://effect.website) variant), API error contracts and a feature
  spec template.

### api-backend

- **Layers**: controller → `*Manager` service → repository → entity. Controllers do
  HTTP only.
- **One firm rule**: no helper functions at module scope. A helper with one caller
  is a `private` method on that class; a shared stateless one is a `static` method
  on a utility class; one with collaborators is an injectable service. Framework
  plumbing is the only exception.
- **Wiring**: Inversify tokens named after their class and where to bind them,
  and why controllers resolve from the container instead of using `@inject`.
- **Patterns** for entities with serialization groups, DTOs, exceptions, error
  middleware, role checks, OpenAPI composition and tests, plus a step-by-step
  checklist for a new endpoint. A project's own base classes and decorator names
  win over the examples.

### semantic-commits

- **Format**: `type(scope): subject`, at most 72 characters, imperative and
  lowercase, with an optional body that explains why.
- **Eleven types**, each with a rule. For example, CSS that users see is `feat` or
  `fix`, never `style`.
- **Scopes** come from the repository's packages; a change that spans packages
  either splits or takes no scope.
- **One logical change per commit**: split by hunk when a file mixes concerns, and
  make each commit build on its own.
- **Breaking changes** take `!` and a `BREAKING CHANGE:` footer saying what to do.
- **Branches and PR titles**: branches are `<type>/<topic>`, and a PR title uses
  the header format, since a squash merge makes it the commit header.
- **Checking and fixing**: a two-line check over the branch's headers, and safe
  ways to fix a header before it is pushed.

## Project add-ons

Every project names its route table, tokens, packages and base classes
differently. The skills discover them, but a short add-on file makes them faster
and keeps project rules from being guessed. Each skill reads
**`.claude/<skill-name>.md`** (or `.agents/<skill-name>.md`) before it starts.
What the add-on says overrides the skill's generic discovery and defaults, and
your instructions in the request override both. Commit add-ons so every
contributor's agent follows the same rules.

| File | Typical contents |
| --- | --- |
| `.claude/ui-balance.md` | Route table and app root, tokens, typography, dialog primitive, chat and comment components, type scale, palette rules, run and check commands. |
| `.claude/polish-page.md` | Shared component names (identity row, meta line, badge, stat, delta, empty state, …), the page-columns helper, header and control sizes, head mechanism and title pattern, copy voice, demo sign-in, pitfalls. |
| `.claude/polish-app.md` | Page order, alternate builds, removed features never to restore, domain rules, commit style. polish-app also reads `polish-page.md`. |
| `.claude/fsd-styled-components.md` | Source root and alias, layer and segment set, state library and binding, HTTP client, optimistic/runner helpers, demo fixtures, architecture doc. |
| `.claude/api-backend.md` | Backend package and alias, base repository/entity names, custom decorators, reference implementations, dev/test commands, generated API client. |
| `.claude/semantic-commits.md` | Scope table (scope → path), the base branch for the header check, what counts as a breaking change here, files to split by key. |

`.claude/ui-balance.md`:

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

`.claude/semantic-commits.md`:

```markdown
# semantic-commits: project add-on

Base branch: dev

| Scope | Path |
| --- | --- |
| `web` | `web/` |
| `api` | `api/` |
| `api-client` | `packages/api-client/` |
| `skills` | `skills/`, `.claude/` |
| `deps` | dependency bumps only, as `build(deps): …` |

- Breaking: removing or renaming an API endpoint or field, an env variable, a
  public route, or an export of `packages/api-client`.
- Split `web/src/i18n/*.ts` by message-key prefix.
```

## Repository layout

```text
.claude-plugin/
  plugin.json                Claude Code plugin manifest
  icon.png                   listing icon
  marketplace.json           marketplace "ivanproskuryakov" with one plugin, "ui-tools"
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

When a skill's scope changes, keep its `SKILL.md` description, the manifests'
descriptions and (for ui-balance) `agents/openai.yaml` consistent.

## License

[MIT](LICENSE)
