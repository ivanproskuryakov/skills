---
name: polish-app
description: Polish a whole web app page by page until every screen is finished, dense, consistent with the others and ready to market. Use when asked for an app-wide polish, consistency or launch-readiness pass across many pages.
---

# Polish the app

The app-wide counterpart of [polish-page](../polish-page/SKILL.md), which takes one page
or a short list of them. Every page still gets the full polish-page pass; this skill adds
what a handful of pages cannot see: the inventory of every screen, drift between pages,
fixes that belong in the shared layer, and the order to work in.

An argument limits the pass to the pages or areas it names (route names, paths, or areas
such as "checkout" or "account pages"). With no argument the target is every page.
As a Claude Code plugin the command is `/ui-balance:polish-app`.

Work in rounds. Stop after the audit and let the user confirm the order, unless they
asked to go straight through. Do not commit until the user asks.

## Inventory

- Read `CLAUDE.md`/`AGENTS.md` and [polish-page](../polish-page/SKILL.md); its rules
  apply to every page here. Read the project add-ons if they exist —
  `.claude/polish-app.md` and `.claude/polish-page.md` (or the same names under
  `.agents/`) — for this project's paths, shared components, page order, copy rules,
  demo setup and pitfalls; they override the generic defaults below, and explicit user
  instructions override both. Apply [fsd-styled-components](../fsd-styled-components/SKILL.md)
  when the project uses Feature-Sliced Design or styled-components, and the project's
  state-management guidance if state changes.
- List every screen from the route table (a router configuration or a file-based
  `app/`/`pages/`/`routes/` directory) and the app root that mounts global overlays.
  Count formats, not just paths: each tab, `?step=` and creation type; detail dialogs
  opened over a page and their phone drawer form; each signed-in-only page for a guest
  and for the viewer; help and legal documents; and any alternate build (a maintenance
  or coming-soon screen). Skip redirects and OAuth callbacks.
- Keep a ledger in the scratchpad with one row per format: route, owning module, feature
  spec if the project keeps specs, last polish commit, and status. Run
  `git log --oneline -- <page's directory>` to find the last polish commit; a
  `polish` commit subject means the page has had a pass already.
- Run the app against demo or mock data where it has them and capture every format, full
  length, at 1440×900 and 390×844, signed in and as a guest. Pre-seed consent banners
  when needed. Name files `<route>-<format>-<width>-<viewer>.png` so the before and after
  shots pair up. Build a contact sheet of every page side by side, because drift between
  pages only shows there.

## Audit across pages

1. **Columns.** Every page with a side rail uses the same layout helper: the rail sits in
   the same place with the same gutter and collapses at the same width, and the top
   bar's search lines up with the main column.
2. **Headers.** Every page header follows polish-page layout rule 5, with the same title
   size, bar height, badge, fact line and trailing actions.
3. **Blocks.** Every side-rail box is the same card with the same heading. Every "View
   all" link, search box and identity row (a person, organization or product) is the
   shared component, never a local copy. Rows show the facts that matter in the domain
   (a product's price and change, a person's record) where the API has them.
4. **One look per thing.** Each domain object (a person, product, post, order, …) looks
   the same on every page, with the same facts and the same CTA wording. List each
   object's renderings across pages, then fold the duplicates into a shared or domain
   component.
5. **States.** Every page has a skeleton in its own shape (never a bare spinner), a
   retryable load failure, an empty state that offers a way on, and a guest gate for
   actions that need an account.
6. **Page heads.** Every route gets a title, and every page or dialog about one thing
   builds its own head. Titles follow one pattern (for example
   `<what is on screen> - <Site> - <slogan>`). A person's own pages and every form are
   `noindex`, and each description says what a visitor can do there.
7. **Copy.** Pages share one voice, from the project's brand or copy guide. The same
   action uses the same verb everywhere, and titles use the same separator.
8. **Controls.** Bars and rows use the same control sizes (polish-page layout rule 6 when
   the project sets none). Related actions sit in joined pills, with at most one filled
   button per area.
9. **Motion.** Blocks reveal the same way on every page, and nothing snaps.
10. **Navigation.** Every page is reachable from the shell or a link, and no state is a
    dead end. Back returns to where the visitor came from.
11. **Domain rules.** Apply the product rules the project records (in its guidance or
    add-on) to every page they touch, such as which options are live or where a CTA may
    lead.

Sweep the frontend source with searches like these, adjusted to its directories and
stack. Each hit is a candidate to judge, not an automatic fix:

```sh
rg -n '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --glob '*.{tsx,jsx,vue,svelte}' --glob '!src/**/theme/**'
rg -ln 'styled\.(button|input|textarea|select)\b|<(button|input|select|textarea)[ >]' src --glob '!src/shared/**'
rg -n "(to|href)=['\"]/|navigate\(['\"\`]/|router\.push\(['\"\`]/" src
rg -n 'document\.title|scrollbar-|::-webkit-scrollbar' src --glob '!src/shared/**'
rg -n "<motion\.|from ['\"](motion|framer-motion)" src --glob '!src/shared/**'
rg -ln '^const (Empty|Failure|Badge|Tag|Chip|Dot|Divider|Eyebrow|Stats?|Name|Handle|Identity) = styled' src
```

The first finds raw colors outside the theme; the second, native controls outside the
shared layer; the third, hard-coded paths where the project has a typed route helper;
the fourth, hand-written heads and scrollbars; the fifth, motion outside the shared
primitives; the last, local clones of shared components.

## Plan

Rank the findings by where the fix lands:

1. **Shared layer first.** A fix in the shared component library, the theme, the app
   shell or a domain component reaches every page at once. When a pattern repeats on two
   or more pages, promote it to the shared component rather than polishing each copy.
2. **Then pages, in the order a new visitor meets them:** the landing or home page, then
   the main browse and detail pages, then the pages a visitor reaches from those. After
   those come the signed-in account pages and the create flows, then help.
3. **Recently polished pages last,** unless the audit found drift in them.

Present the inventory with each page's status, the cross-page findings grouped by where
each fix lands, the order, and anything that needs a product decision or backend work.

## Rounds

- **Round one is the shared fixes.** After each one, find every importer of what
  changed and recapture those pages. A shared change is not done until every page that
  uses it has been checked.
- **Each later round covers one page,** or a few that share a module, with the full
  polish-page pass: before changing anything, layout, components and code, finish, and
  verify. Keep each page's changes inside its own module, plus the shared fixes it needs.
- **After each round,** update the ledger and re-run the cross-page measurements on the
  pages it touched.
- **Edit in sequence.** The worktree may be shared with other sessions, so preserve their
  work. Parallel agents may only do read-only work: captures, sweeps of a module, a
  page's audit. Never let two agents edit at once.

## Verify across the app

- Measure, don't eyeball. One browser script, run over every route at 1440 and 390,
  collects the page title's size and weight, the header bar's height, the x and width of
  the main column and the rail, the rail card headings' size, and the gaps between cards.
  Every value should agree across pages, and an outlier is a finding.
- On every route, check `document.title`, the description, the canonical and robots
  against the rules above. The console should show no errors, and no request should go
  unanswered: in a mock mode, an unhandled request is a missing mock.
- Walk the shell navigation at 1440 and 390. Open the shared detail dialogs from at
  least three different pages. As a guest, try each page's primary action and confirm
  the sign-in gate appears.
- Run the frontend's typecheck, lint, the full test suite (a shared change touches
  everything) and build, from `package.json`, the task runner or CI. When a shared
  component changes, open its stories.
- Report the ledger as a table (page, status, what changed and why), before and after
  contact sheets, the cross-page measurements, the remaining backend or data
  dependencies and product decisions, and any page the pass did not reach.

## Commits

Commit only when the user asks. Then make one commit per shared change and one per page
(for example `feat: polish the <page>`, in the repository's commit style —
[semantic-commits](../semantic-commits/SKILL.md) when it uses Conventional Commits), with
a body grouped by block. Stage only this session's hunks.

## Pitfalls

- Everything under polish-page's pitfalls still applies.
- Some features were removed on purpose, and a polish never brings them back. Check the
  project's guidance, add-on and `git log` before restoring a block that looks missing.
- Demo media comes from generated fixtures or drawn placeholders; never slice an image
  from a design mockup.
- A mock mode may sign in again on every full reload; reach the guest state the way the
  project documents.
- Browser viewport emulation can reset after a full reload, so set the size again before
  measuring.
