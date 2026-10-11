# FSD + styled-components reference

Examples and conditional guidance for [the skill](SKILL.md). Paths, token names
and helpers below are illustrations; use the project's own. They are not a second
set of rules overriding the entrypoint, the project's guidance or the user's task.

## Public boundaries and demo code

Use `@/entities/post` or an intentional `@/entities/post/api` barrel for production
consumers. Barrels should expose the slice's public contract, not its private stores,
fixture factories, or implementation tree.

Tests running in Node sometimes deep-import a transport or pure model module to
avoid a root barrel that loads UI. Storybook and demo adapters (an in-memory
database, mock handlers, `model/demo.ts` fixtures) also stay off production barrels
so they are not bundled with the app. Keep such imports confined to tests, stories,
and explicit demo bootstrap code.

When the app has a demo or mock mode, generate its pictures and people rather than
slicing them from design files: a seeded fake-data generator (Faker with a fixed
seed per key, so the same key always yields the same person and picture) or a
drawn placeholder, which is also what a production screen can show when a row has
no picture of its own. A UI file never names a demo asset path; a fallback is a
drawn placeholder from the shared toolkit.

Reuse the mock layer's fixtures for integration tests and stories where
appropriate. Do not solve a testing import problem by exporting mocks from a
production barrel. If changing bundling, verify the production import graph rather
than assuming tree-shaking removes a top-level side effect or a dynamic import
behind a runtime flag.

## Components and styling

- Use kebab-case filenames and PascalCase components. Prefer descriptive names such
  as `user-card-header.tsx`; follow the slice's existing organization without
  renaming unrelated files. Keep `Props` private unless callers need the type.
- File order: imports, constants, props, component, then module-scope styled
  declarations in markup order. Let the repository formatter/linter order imports.
- Name the outermost styled container `Root`, and local parts by role:
  `Header`, `Body`, `Label`, `Actions`. A fragment needs no artificial wrapper.
- Reuse exports from the shared UI barrel, including its input, textarea and button,
  before introducing a feature-local control. Extend with `styled(Component)`;
  forward `className` to the element being styled.
- Use theme tokens for colors, type, spacing, radii, and motion, and the theme
  media helper for breakpoints. Read the project's token documentation when
  changing the shared scale. Dynamic measurements, progress, and media URLs can use
  inline styles or custom properties; finite variants belong in CSS.
- Declare styled components at module scope. Keep selectors shallow and avoid
  reaching into another component's internal DOM. If descendants share a variant
  value, set a component custom property on `Root`.
- Resolve specificity without adding `!important`; use `&&` only for a verified
  conflict and explain it locally.
- Split a component when it contains independently complex responsibilities, not
  merely because it crosses a line count. Splitting UI does not require giving each
  child its own network request.

## Styling example

The public variant union and semantic attributes describe a finite set of looks.
A CSS property lets descendants share the selected color:

```tsx
import styled from "styled-components";

type Props = {
  tone: "neutral" | "positive" | "negative";
  pending?: boolean;
  className?: string;
  onClick: () => void;
};

export const MetricAction = ({ tone, pending, className, onClick }: Props) => (
  <Root
    className={className}
    type="button"
    data-tone={tone}
    disabled={pending}
    aria-busy={pending}
    onClick={onClick}
  >
    <Label>View activity</Label>
  </Root>
);

const Root = styled.button`
  --metric-color: var(--text-default);
  padding: var(--space-2);
  color: var(--metric-color);

  &[data-tone="positive"] {
    --metric-color: var(--success);
  }
  &[data-tone="negative"] {
    --metric-color: var(--danger);
  }
`;

const Label = styled.span`
  font-weight: var(--font-weight-semibold);
`;
```

Use `.attrs()` to fix repeated props when it improves readability. References such
as `${Root}[data-variant='compact'] &` are suitable within a slice; avoid coupling
one slice's styles to another slice's internals.

Named grid areas require matching placement on the rendered grid item. Writing
`'avatar title time'` does not assign `grid-area: avatar` to an `Avatar` child.
When a component adds a wrapper, place the wrapper or use a local grid slot; do not
assume a forwarded class lands on the outermost grid item.

## Actions

A multi-step user-triggered flow does not live inside a component. Put it in the
slice's `action` segment, beside `ui`, as a function the state layer runs — a
shared handler with its `*Handlers` contract. State-manager events, effects and
wiring live in `state`; those effects run the handlers. See
[placement and imports](SKILL.md#placement-and-imports).

Move a handler out when it does more than one thing: validates input, calls a
client, branches on the result, reports failures, or triggers navigation or a
refresh — the shape of a `submit`, `save`, `publish`, `join`, `toggle` or
`delete` handler. An inline handler may dispatch a single bound event; do not add
an `action` file per `onClick`.

- One flow per file, kebab-case and named for the flow (`action/submit-community.ts`),
  exporting a verb-named function (`submitCommunity`).
- Keep the module free of React: no hooks, no JSX, no `set*` setters in the
  signature. It imports `api`, `model`, and shared helpers, and is runnable from a
  plain test.
- Take the form values as one input object, and the outcomes the caller owns —
  navigation, field errors, model events or bound state commands — as an explicit
  handlers argument. Name them by outcome (`onCreated`, `showSlugError`) rather than
  passing the component's raw state setters.
- An `action` is internal to its slice by default. Export it from the slice barrel
  only when another slice runs the same flow, such as a reaction toggle that
  several post lists share.

State stores own the in-flight flag and double-submit guard; the component binds
them and derives disabled/label text. Name UI bindings `handle*` so they do not
shadow the props they are passed to. A one-step inline handler dispatches a bound
event; it does not keep React state or call a client. A lifecycle read a screen
performs on mount is an effect in the slice's `state`, started by the component's
open event and guarded against stale results.

### With Effect

If the project writes actions with [Effect](https://effect.website), the flow is a
description and a state effect runs it. `try`/`catch`/`finally` becomes
`Effect.catchAll` / `Effect.ensuring`, an early return becomes `Effect.void`, a
side effect becomes `Effect.sync`, and a promise the flow has to call — a picker,
a prop, a hook's transport — comes in as a parameter and is lifted with
`Effect.promise` or `Effect.tryPromise`. Branch a result union with `Match` once it
has three or more arms, and with a ternary below that.

Two return types, and they say who reports the failure:

| Returns               | Failure                         | The state effect runs it with |
| --------------------- | ------------------------------- | ----------------------------- |
| `Effect<void>`        | The action reports it           | `Effect.runPromise`           |
| `Effect<A, ApiError>` | Deliberately left to the caller | a runner that rejects with a plain `Error` |

Use the second only when a control already shows the rejection — a card's join
button, for instance. Prefer a shared optimistic-update helper that attaches the
revert to the failure channel over writing flip / await / revert by hand, so the
revert cannot be forgotten on a branch.

## Action example

The shared flow describes the mutation; a state effect runs it. Pending, errors,
double-submit guards, and optimistic data live in the owning `state` model:

```ts
// features/event-rsvp/action/toggle-going.ts
export type ToggleGoingHandlers = {
  /** Flip the row's `joined` and its count; called again to undo a failure. */
  flipCard: (eventId: string) => void;
  showEvent: (event: CommunityEvent) => void;
};

export const toggleGoing = (
  event: CommunityEvent,
  { flipCard, showEvent }: ToggleGoingHandlers,
): Effect.Effect<void, ApiError> =>
  optimistic(
    () => flipCard(event.id),
    event.joined ? leaveEvent(event.id) : joinEvent(event.id),
  ).pipe(Effect.flatMap((saved) => Effect.sync(() => showEvent(saved))));
```

Run it inside the owning state effect. Supply `flipCard` and `showEvent` as named
outcomes backed by the model's events; keep the handler count meaningful. A flow
needing a callback for every branch may represent multiple flows. The component
dispatches the bound command and renders the model's pending/error state; it does
not call the client, maintain `setBusy`, or update an array through a React setter.

An action that reports its own failures ends in `Effect.catchAll` and returns
`Effect<void>`; the state effect runs it with `Effect.runPromise`. If a control
needs an awaitable result, expose and bind that effect through the wired barrel.
Preserve the rejection when the caller owns error presentation.

Where a flow has a step whose failure must stop it without being confused for the
next step's, settle that step as a value first — `Effect.either` — rather than
tagging the error channel:

```ts
mediaUri
  ? Effect.either(uploadImage(mediaUri)).pipe(
      Effect.flatMap(
        Either.match({
          onLeft: (error) => Effect.sync(() => dialog("Upload failed", apiErrorMessage(error))),
          onRight: publish,
        }),
      ),
    )
  : publish();
```

## API errors and loaders

Choose one contract per function:

| Function kind                                  | Result                                | Failure owner                                 |
| ---------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| Transport client (`get*`, `fetch*`, `list*`)   | Domain DTO or established result type | Caller catches rejected requests              |
| Route loader specified to return a state union | Every declared outcome                | Loader classifies failures                    |
| Mutation                                       | Updated value or established result   | Calling model/UI handles failure and rollback |

Use existing naming and serializers; split API files by cohesive use case when a
file becomes difficult to navigate. Do not rename all clients to enforce a verb
list.

A loader classifies the status while it still has the response/status information.
Distinguish a retryable outage from an actual 404. Where content is hidden from
some audiences, return the same not-found outcome as for a missing item: never
infer or reveal the existence of hidden content.

In every shape, application HTTP uses the project's shared authenticated client.
Authentication belongs to the shared session layer; a screen handles the visible
failure without implementing a second token-refresh or sign-out policy.

## Feature spec template

Use for a new feature or an intentional contract change. Omit sections that do not
apply; an existing feature spec is usually the starting point.

```md
# Feature name

## Outcome

User-visible behavior and acceptance criteria.

## Placement

Owning slice and segments; allowed dependencies.

## Public API

Exports and their barrels; props, callbacks, or slots at composition boundaries.

## Model and API contract

Types, invariants, request/response shapes, state ownership, failure behavior.

## Visual variants

Attribute or native/ARIA state, allowed values, default, and visual effect.
Reference the design and existing tokens.

## Composition

Major regions and file paths; identify who owns data and actions.

## Verification

Meaningful logic tests, representative stories, and interaction/visual checks.

## Out of scope

Explicit non-goals and deferred work.
```
