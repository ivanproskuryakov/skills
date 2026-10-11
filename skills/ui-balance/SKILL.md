---
name: ui-balance
description: Polish the visual consistency of a web app's existing frontend across pages, dialogs, lists, chats and comments. Reviews and fixes typography, colors, spacing, component sizes, alignment and interaction states in the running app, with measured before/after evidence, while preserving product behavior and design. Use when asked for a UI balance, visual consistency or finish pass, or an audit of one, over a whole app or named screens.
---

# Balance the app UI

Audit and fine-tune the complete visual presentation of the project's existing web
frontend: typography, color, spacing, component geometry, density, alignment and
visual interaction states. Judge whole screens and their internal surfaces
together; font-size and line-height checks alone do not complete this skill.

With no arguments, cover the active app, including the shell and any global chat,
dialogs, lists and comment/reaction surfaces it has. Named routes, features, or
components narrow the scope; include the interaction surfaces they open.
`audit only` means report findings without edits.

Related overlays and form steps belong to a scoped pass; ordinary links to other
features do not recursively expand it. Determine each format from current code
and the running app instead of assuming a detail view is still a dialog.
Proceed through authorized fixes without an audit approval pause. Commit only
when requested.

Examples (as a Claude Code plugin the command is `/ui-balance:ui-balance`; other
agents use their own skill syntax, such as `$ui-balance` in Codex):

- `/ui-balance` — the active app, including its dialogs and other overlays.
- `/ui-balance settings, feed, product details` — those features and their flows.
- `/ui-balance dialogs, chat, comments` — those surfaces and their variants.
- `/ui-balance audit only /messages` — findings and evidence for messages.

## Establish the scope

- Read repository guidance (`CLAUDE.md`, `AGENTS.md`, contributing and frontend
  docs) and check the worktree before editing. Preserve unrelated and concurrent
  changes. Keep implementation in frontend styling and layout; do not modify
  backend, migrations, application configuration, or tests.
- Read the project add-on if one exists: `.claude/ui-balance.md`, or
  `.agents/ui-balance.md`. It names this project's paths, conventions, type scale,
  palette rules, chat/comment surfaces and check commands, and overrides the
  generic discovery and fallbacks below. Explicit user instructions override both.
- Find and follow the project's own styling conventions: the frontend sections of
  `CLAUDE.md`/`AGENTS.md`, project skills about components or styling (for
  example under `.claude/skills/` or `.agents/skills/`), a design-system or
  style-guide document, and the lint/stylelint rules that enforce them. When the
  project uses Feature-Sliced Design or styled-components, apply the
  [fsd-styled-components](../fsd-styled-components/SKILL.md) skill. Read only
  the relevant feature specs and design references. Use current shared theme
  tokens and component variants as the starting point; explicit user corrections
  take precedence over older specifications.
- Find the route table and the app root: a router configuration (React Router,
  Vue Router, TanStack Router, Angular routes) or a file-based `app/`, `pages/` or
  `routes/` directory (Next.js, Remix, SvelteKit, Nuxt, Astro), and the root
  component that mounts the shell, providers and global overlays. Then read the
  owning features. Trace overlay triggers and shared components from those
  features. Routes alone are not the inventory: dialogs and popovers often render
  in portals outside the page root. Include the sidebar/mobile drawer, and any
  global chat or inline comment threads the app has, even when they have no route
  of their own.
- Reuse a running local dev server or start one with the project's own scripts
  (`package.json` scripts, the monorepo task runner, a `Makefile`, the README).
  Prefer demo or mock data, seeded fixtures and existing Storybook (or Ladle,
  Histoire) states; never run the pass against production data. Do not change
  feature flags to expose disabled screens; record them as source-only or
  unavailable.

Keep a coverage ledger in scratch artifacts. Each row identifies the route,
feature, format/state, owning component or module, opening control,
close/back/reset action, viewer mode, viewport, status, and evidence. Useful
statuses are `pending`, `verified`, `fixed and verified`, `source-only`, and
`blocked` with a reason. Also record the review result for typography, color,
spacing, geometry/density and interaction states. Mark a surface verified only
after every applicable dimension has been visually inspected; record why a
dimension is not applicable or could not be checked. A font snapshot is not
evidence for the other dimensions.

## Navigate features, not just URLs

For each feature, discover and walk the states it actually provides:

- Page variants: tabs, filters/search, expanded sections, creation steps and
  detail views. Exercise representative long names and text where existing data
  or stories provide them.
- Overlays: dialogs, drawers/sheets, nested dialogs, dropdowns, popovers, tooltips,
  and inline editors. Open them through their real controls, inspect their header,
  body, footer, internal cards/lists, form states and scroll area, and close them
  before continuing. Inspect desktop dialogs and phone drawer variants separately
  where both exist.
- Lists: repeated item heights, avatar/icon/control sizes, separators, text
  hierarchy and action placement. Include short and wrapped rows, long names,
  selected/disabled states and the phone arrangement of actions.
- Chat and comments, if the app has them: inspect any global chat in the shell,
  room/community/direct-message chat variants in scope, and comment threads opened
  from feeds and detail views. Include nested replies, compact action/reaction
  bars, counts, selected states, and existing reaction pickers/details. Inspect
  the rendered implementation: comment reactions may use Like/Reply/Share
  controls rather than emoji badges.
- Forms: labels, inputs, help text, validation, disabled/busy controls and action
  rows. Check matching placeholder and entered-text styling. Use reversible demo
  input; do not submit a real transaction or publish content to inspect a state.
- Existing loading, empty, failure and guest/sign-in states. Use available demo
  scenarios or stories; if a state cannot be reached, report the gap. Do not force
  DOM changes and call the result a verified feature state.

Navigating a trade, purchase, payment, wallet, deletion or publishing flow
authorizes visual inspection, not its consequential final action. Inspect up to
that boundary and record any resulting coverage gap. Do not send messages or alter
real user data as part of this pass.

Capture baseline screenshots; after a fix, capture the same route, state, viewer
mode and viewport again. Audit-only runs require baseline evidence without edits.
Use 1440×900 and 390×844 for pages and meaningful overlay formats. Add 1280 and
1920 widths for shell/shared changes and width-sensitive layouts. Verify the
actual viewport after navigation or reload. Wait for the relevant content and
fonts to finish loading, and for animated layout to settle, before measuring.
Use the available browser's supported APIs; keep browser actions in its supported
automation tool rather than building a second browser controller.

## Review the whole surface

Read the applicable sections of [visual-review.md](references/visual-review.md)
for dialogs, list items, chat, comments/reactions and shared color/spacing rules.
For an app-wide invocation, cover all those surface families the app has.

| Dimension | Judge together |
| --- | --- |
| Typography | Role, family, size, weight, leading, wrapping and hierarchy |
| Color | Text/icons, painted backgrounds, borders, semantic tones and contrast |
| Spacing | Outer margins, content padding, gaps, section rhythm and visible distances |
| Geometry and density | Rows, controls, icons/avatars, surface widths/heights, alignment and scroll areas |
| Visual states | Hover, focus, selected/pressed, disabled, busy, error and empty states |

Collect computed styles and boxes for the **containers and controls** as well as
text: foreground/background paint, opacity, borders/radii/shadows, font properties,
wrapping, margins/padding/gaps, icon/avatar dimensions and scroll geometry. Include
portal roots, dialog header/body/footer and the repeated row or reaction pill.
[measure-ui.js](references/measure-ui.js) is an optional read-only browser expression
for a scoped snapshot; read it when collecting measurements and execute it through
the browser's documented evaluation API. Its output flags candidates, not confirmed
defects or an automated contrast pass. Inspect actual screenshots alongside it.
If a snapshot is truncated, narrow its scope or collect the remaining sections;
the sampled rows do not establish complete coverage.

Compare equivalent roles across features and variants: page and section titles,
dialog titles, tabs/navigation, labels, buttons, body copy, metadata, captions and
financial or numeric values. Read the current definitions in:

- The design tokens: a theme or tokens module, CSS custom properties on `:root`,
  a Tailwind/UnoCSS config, Sass variables, or a design-token JSON file.
- The shared typography components or text styles (a `Text`/`Heading` component,
  typography variants, utility classes).
- The size models and styles of relevant shared controls (button, input, select,
  tabs, badge, avatar).

When the project defines a type scale, it is the reference. When it defines none,
start from this hierarchy: 20px page titles, 17px section headings, 15px body
copy, 13–14px compact controls, and 12–13px metadata/captions. Either way, phone
text inputs use at least 16px. These are role defaults, not blanket replacements:
preserve intentional hero copy, prominent prices, display figures, tiny decorative
badges and feature-specific hierarchy. Normal copy usually uses weight 400,
controls 500, labels 600, and headings 700; judge the semantic role and the loaded
font, rather than bolding all small text.

Compare equivalent semantic colors across features. Use readable text/link tokens,
surface fills and border tones for their intended roles: a bright brand or accent
fill is not a substitute for the readable accent text color on small text, since
a saturated fill can fail contrast as type. Check text and icons against the
background actually painted beneath them, including ancestor opacity, translucent
surfaces, artwork and gradients. Preserve meaningful success/error and
selected-state distinctions; avoid making every caption or control the same tone.

For spacing, compare related components and use the project's spacing scale
(commonly 4px or 8px steps). Inspect actual distances between boxes: parent gap,
child margin, margin collapse, padding, line height and alignment can combine into
an error. Keep sensible relationships between title/body, label/input/help, card
sections and action rows. Equal CSS margins do not prove equal visible spacing.

Look especially for:

- Nested text components or control defaults resetting inherited size, weight or
  leading; declared custom properties or theme values that never reach the
  rendered element.
- Browser default heading/paragraph margins or sizes, and mismatched placeholder,
  animated search hint, entered text, tab and navigation labels.
- Overly heavy captions, unreadably small meaningful text, cramped line height,
  inconsistent button baselines or icon/text centers, and doubled gaps.
- Faint body/chat text, accent fill used as text color, disappearing focus/pressed
  states, mismatched card/dialog backgrounds and noisy or inconsistent borders.
- Dialog content inset twice, disconnected title/body/footer spacing, oversized
  or cramped list rows, and comment reaction pills that drift from nearby text.
- Clipped or overlapping text, awkward wrapping, ellipsis that hides required
  information, and document/dialog horizontal overflow at narrow widths.

Do not shrink text merely to conceal overflow. Correct the layout, wrapping or
spacing cause while preserving readable text, control hit areas, accessible names
and existing interaction behavior. Distinguish intentional truncation from a bug.

## Fix and verify

- Fix shared causes first in the shared component library, theme/tokens, app
  shell or shared domain components, then local exceptions in their owning
  features. Use the project's semantic text components, existing tokens and the
  supported control variants or style hooks for color, geometry and spacing as
  well as type. Do not add a global CSS override that flattens hierarchy or recolor
  the app without an observed consistency/readability problem.
- Edit sequentially. Parallel agents may audit separate features or review
  evidence read-only. Trace consumers of changed shared components and recheck
  their meaningful size/variant/overlay usages; one story or one route is
  insufficient.
- Recapture affected states and compare their measurements with the baseline.
  Recheck every affected dimension and judge the complete screen again: solving
  one text size can expose crowded rows or weak color hierarchy. Verify clipping,
  overflow, focus/keyboard use and open/close behavior. A clean console and coherent
  screenshots complement the measurements.
- Run the frontend's own typecheck, lint and build for frontend changes. Find
  them in `package.json` scripts, the monorepo task runner (Turborepo, Nx, a
  workspace filter for the frontend package), a `Makefile` or the CI workflow.
  Run existing relevant tests, and the full frontend suite when shared behavior
  warrants it. Inspect affected Storybook variants when available. Do not add
  cosmetic tests or edit tests to make a pass green. Report actual completion and
  failures.
- If only documentation changed, validate links, frontmatter and instruction
  consistency instead of running application checks.

Finish when every inventoried active surface has a final status and review results
for all applicable dimensions, with no pending rows, and fixes have been rechecked.
Require a coherent visual hierarchy, readable colors, deliberate spacing and row
density, aligned controls and finished dialog/chat/comment states across the checked
features. Do not stop after normalizing fonts or claim whole-app verification for
source-only or unreached states.
Report the main fixes and reasons, a concise coverage ledger, measured typography,
color, spacing and geometry changes, useful before/after screenshots, check results
and remaining gaps. Retain the evidence in scratch artifacts, reset temporary
viewport overrides, and stop only servers/tabs created for this pass.
