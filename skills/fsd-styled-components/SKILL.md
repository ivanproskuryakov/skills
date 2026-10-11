---
name: fsd-styled-components
description: >-
  Apply Feature-Sliced Design placement, public exports, styled-components and
  data-attribute variant conventions in a React frontend. Use for component
  implementation or review, frontend refactors and feature specifications in a
  project built with FSD and/or styled-components; not for backend work.
---

# FSD + styled-components

Conventions for a React frontend organized by Feature-Sliced Design and styled with
styled-components. The project's own guidance wins over these defaults: read
`CLAUDE.md`/`AGENTS.md`, its architecture or spec document, and the project add-on
(`.claude/fsd-styled-components.md` or `.agents/fsd-styled-components.md`) if one
exists; it names the source root, layers, segments, state library and shared
helpers this skill otherwise has to discover. Explicit user instructions override
both.

Read the affected feature spec and neighboring code. A small fix does not require
a new spec or decomposition; change a spec only when intentionally changing its
contract. Reviews produce findings within the requested scope, not edits or
cosmetic naming findings. Inspect the relevant design reference for visual
fidelity; preserve deliberate artwork.

## Placement and imports

| Layer    | Owns                                   | Default imports            |
| -------- | -------------------------------------- | -------------------------- |
| app      | Bootstrap, providers, routes, shell    | Layers below               |
| pages    | Route composition                      | widgets, features, entities, shared |
| widgets  | Composed page blocks (if the project uses the layer) | features, entities, shared |
| features | Interactions and composed capabilities | entities, shared           |
| entities | Domain contracts, state, views         | shared                     |
| shared   | Domain-independent primitives          | shared                     |

Find the source root and its path alias (`tsconfig` `paths`, the bundler's
`resolve.alias`; `@` is common). Use the layers the project has: some drop
`widgets` and keep app chrome in `app/shell`. Imports point downward; slices on the
same layer do not import each other except through the exceptions the project
documents (FSD's `@x` cross-import notation or an explicit list). Existing
violations grant no new exceptions. Entity views receive feature actions as
props/slots.

Across slices import through slice roots (`@/entities/post`) or deliberate segment
barrels; within a slice use relative imports. Export only consumed symbols; no
empty barrels or segments. Node tests may use narrow API/model entrypoints to avoid
loading UI. Keep demo adapters and fixtures off production barrels; read
[public boundaries and demo code](REFERENCE.md#public-boundaries-and-demo-code)
when changing demo assets, stories, test imports, or bundling.

Segments, unless the project defines its own set: `ui` components, `hooks` React
hooks, `model` types/constants/pure logic, `api` transport, `state` all
state-manager code, `action` shared multi-step flows with a `*Handlers` contract,
`config` configuration. Prefer no slice-local `lib`; `shared/lib` is the toolkit.
Hooks live in `hooks` (`shared/hooks` for shared ones); their pure types/helpers
belong in `model`. Add `__fixtures__` only when useful.

## State and API boundary

Components hold no application or local interaction state. The project's state
manager owns it in `state`, including loading, timers, polling, subscriptions and
mutation handlers. React keeps router/context hooks, DOM refs, imperative
focus/scroll/measure, and `useId`. Single-instance state resets on close and
rejects stale results; simultaneous instances need keyed state. Never put
state-manager code in `model` or `action`. With Effector, bind units with
`useUnit` and report mount/unmount with an event pair; with another library, use
its idiomatic binding and the same ownership.

`model` is independent of React, I/O and the state manager. State effects execute
shared `action` flows; a simple UI handler may dispatch a bound event inline. When
implementing or reviewing a multi-step action, read [Actions](REFERENCE.md#actions)
and its example for execution, handlers, error ownership and optimistic rollback.

Application HTTP goes through the project's shared authenticated client; callers
do not pass bearer tokens or implement refresh. Preserve return contracts: DTO
clients may reject; state-union loaders classify all failures. Do not turn outages
into empty success/not-found; retain feature-specific audience hiding. For
client/loader changes read [API errors and loaders](REFERENCE.md#api-errors-and-loaders).

## Components and styling

Use kebab-case files, PascalCase components, private `Props` unless consumed,
module-scope styled components, and `Root` for the outer styled container. Reuse
the shared UI barrel and the theme tokens (find them under `shared/ui` and
`shared/theme`, or wherever the project keeps them). Forward `className` when
extending a component. Finite variants belong in CSS; dynamic measurements,
progress and media URLs may use inline styles/custom properties.

For component or styling changes, read
[Components and styling](REFERENCE.md#components-and-styling). Read the
[styling example](REFERENCE.md#styling-example) only when variant inheritance or
grid placement needs clarification. Splitting UI does not give every child its own
request. Do not rename unrelated files.

## Variant contract

Use typed lowercase finite axes (`data-variant`, `data-size`, `data-tone`); reusable
unions belong in `model`, local ones may stay with the component. Boolean presence
attributes are absent when false: `data-active={active || undefined}`.
Prefer native/ARIA/Radix state (`:disabled`, `:checked`, `:focus-visible`,
`aria-expanded`, `data-state`). Styling busy does not disable interaction; preserve
keyboard/native semantics. Keep content and sensitive data out of style attributes.

## Specifications and verification

For a substantial new feature, establish placement, exports, behavior and variants;
use the [feature spec template](REFERENCE.md#feature-spec-template) if a new spec is
needed. Load only the relevant reference sections, not the whole reference.

Check affected public boundaries and meaningful visual/interaction states, including
loading/error/empty and keyboard behavior. Reuse stories/tests; cover changed logic
without adding tests for every cosmetic edit. Run the frontend's own checks
(typecheck, lint, tests, build from `package.json`, the task runner or CI) and
report completed results and gaps. A few checked features do not establish
whole-app compliance.
