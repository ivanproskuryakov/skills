---
name: polish-page
description: Polish one or more pages of a web app until each is dense, complete, visually refined and ready to market. Use when asked for a thorough page-polish pass over one page or a short list of pages, with responsive screenshots and measured verification.
---

# Polish a page

Polish the pages named by the user until each one is finished, dense, and ready to market to real users. Treat every URL or app path supplied with the invocation as a target page, in the order given; the words around them are directions for the pass. With one target, the rest of this skill applies to it; with several, it applies to each of them, and [Several pages](#several-pages) adds how to run the set. If no page is identifiable from the request or current browser context, ask for its URL.

Work in rounds when the user wants an iterative review: complete a full pass, present the result, then apply feedback and re-verify. Do not commit until the user asks.

Examples (as a Claude Code plugin the command is `/ui-balance:polish-page`):

- `/polish-page /settings` — one page.
- `/polish-page http://localhost:5173/products /products/42 keep the hero` — two pages and a direction.

## Several pages

- **Read the list.** Split the targets on spaces, commas and new lines, strip the origin (`http://localhost:5173/tokens` is `/tokens`), and drop duplicates. A query variant (`?section=`, `?tab=`, `?step=`) is a format of the same page, not another page.
- **Plan before editing.** For each target, find the owning module in the route table (a router configuration or a file-based `app/`/`pages/`/`routes/` directory), its feature spec if the project keeps specs, and its last polish commit (`git log --oneline -- <page's directory>`). Pages that share a module, such as `/communities` and `/communities/:slug`, get one pass together. Keep the user's order otherwise.
- **Capture the whole set first,** before any change, so the before shots all show the same code.
- **Shared fixes once.** When two targets draw the same thing — a card, a row, a header, a side-rail block — fix it in the shared component, the theme or the domain component, then recheck every target and every other importer of what changed.
- **Then one full pass per page,** in order: before changing anything, layout, components and code, finish, and verify. Finish and verify a page before starting the next. Keep each page's changes inside its own module, plus the shared fixes it needs.
- **Keep the set consistent.** Measure the same things on every target: title size, header bar height, main column and rail x and width, card heading size and the gaps between cards. Values should agree across the set, and an outlier is a finding.
- **Rounds.** Go straight through the list and present the whole set at the end, unless the user asked to review each page before the next.
- **Report per page.** One short section per page — what changed and why, before and after screenshots, remaining dependencies — then the shared changes and the pages each one touched.
- **Commits,** when the user asks: one per page (for example `feat: polish the <page>`, in the repository's commit style), plus one per shared change, staging only this session's hunks.
- **Whole app or a broad area** ("every account page", "all checkout screens"): use [polish-app](../polish-app/SKILL.md) instead, which adds the full inventory and the cross-page audit.

## Before changing anything

- Read the repository guidance in `CLAUDE.md`/`AGENTS.md` and the project add-on if one exists: `.claude/polish-page.md` or `.agents/polish-page.md`. It names this project's shared components, layout helpers, density numbers, copy rules, demo setup and pitfalls, and overrides the generic defaults below. Explicit user instructions override both.
- Follow the project's frontend conventions. When it uses Feature-Sliced Design or styled-components, apply the [fsd-styled-components](../fsd-styled-components/SKILL.md) skill; apply the project's state-management guidance if state changes.
- Inspect the applicable feature spec and design reference.
- Capture the page as it is, full length, at 1440×900 and 390×844. Use the available browser automation, run the app against demo or mock data where it has them, and pre-seed consent banners when needed.
- Inventory every visible block. Look for repeated facts, identities or CTAs; unfinished controls; raw colors or spacing; local clones of shared components; and missing loading, empty or error states.

## Layout

1. Show each fact once. Merge blocks that repeat the same name, logo, price, status or action.
2. Group related content in one card with one border. Put media flush at the top, padded rows below it, and hairlines between distinct rows.
3. Make adjacent panels share a height through grid layout rather than fixed heights.
4. Keep related content in the same column. Put secondary tools under the side panel and make them sticky when the main column scrolls.
5. Keep the page header compact: the project's page-title size (about 20px when it defines none), one small status badge, a single quiet line of facts, and trailing actions. Let facts truncate; use a container query to move them below the title on narrow widths. On phones, give icon-only actions their own line and preserve accessible labels.
6. Group related actions into joined pills. Unless the project sets its own sizes, use 26–28px controls in bars and 20–24px chips inside rows, with at most one filled button per area.
7. Do not style non-actions as buttons.
8. Align paired information rows across columns. Measure their vertical centers and make them match to the pixel.
9. Use a dense rhythm: 8px padding and gaps inside cards, 24px action lines, and inline pitch, tags and chips where they fit — or the project's own density tokens.

## Components and code

- Reuse the shared component library first: an identity row (avatar or logo with name and subtitle), a quiet meta line of facts, badge, status dot, stat and stat group, signed change (delta), tag list, social links, button, popover, dialog, empty state, load failure and skeleton — under whatever names the project gives them. Build a missing one in the shared layer when two pages need it, not as a local clone.
- Follow the repository's styling and architecture conventions. Use theme tokens, CSS grid, container queries, and finite variants (`data-*` attributes or the project's variant API). Avoid raw colors, magic spacing values, and local component clones.
- Keep application and interaction state where the project keeps it (its state library), not in ad-hoc component state. Put pure helpers in the module's model/logic layer and add meaningful unit tests.
- Preserve unrelated behavior and existing public boundaries.

## Finish the page

- Use motion only through the project's motion primitives: staggered fades for block reveals, presence/collapse for conditional content, animated numbers for live figures, and a pulsing status dot for live state. Respect reduced motion.
- Add promotional content only when the page has a real next step backed by real data. Do not invent prices, availability, metrics or social proof.
- Give the page its head through the project's mechanism (a head hook, `generateMetadata`, `<svelte:head>`, a meta manager): a title in the site's pattern, a description explaining what visitors can do, an image when available, and the correct Open Graph type. Keep the builder pure and test it.
- Cover the states relevant to the page: matching skeleton, retryable error, empty, guest/sign-in gate, stale or reconnecting data, and copy/share feedback.

## Verify

- Run typecheck, lint the changed files with zero errors, and run the relevant frontend tests. Run the full frontend suite when shared behavior warrants it. Find the commands in `package.json`, the task runner or CI.
- Capture every meaningful page format and state at widths 1280, 1440, 1920 and 390.
- Measure alignment, equal panel heights, and bar height with browser scripts rather than judging by eye.
- Exercise the relevant interactions, including primary CTA, follow, like, share and copy where present, and confirm the browser console has no errors. Stop at the final step of a purchase, payment, deletion or publishing flow.
- Report what changed and why, include useful screenshots, and identify any remaining backend or data dependency.

## Pitfalls

- A global CSS reset can change element defaults (for example, SVG made block-level); icons inside running text may need `display: inline-block`.
- Retune a shared control through the hooks it supports (custom properties, variants, size props) in a wrapper, not by overriding its internals; low-specificity `:where()` rules are easy to beat by accident.
- An identity row's subtitle may need to wrap when it holds a chip.
- A hidden browser can freeze `requestAnimationFrame`; use a visible or suitable headless browser for motion-sensitive screenshots.
