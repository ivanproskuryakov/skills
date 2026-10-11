# Visual review criteria

Use the relevant sections while inspecting a surface; an app-wide pass covers
every section for which the app has surfaces. Compare equivalent roles across
features and inspect the surrounding screen as well as the isolated component.
These criteria support the existing design and product behavior, without
introducing a new palette or layout system. Paths and contracts named in the
project add-on (`.claude/ui-balance.md` or `.agents/ui-balance.md`) take the
place of the discovery hints below.

## Colors, spacing and component geometry

- Compare body, author/name, metadata, link, warning/error and disabled tones.
  Read the project's current semantic color tokens; bright brand/accent fills and
  readable accent text have different jobs. Preserve the existing neutral/accent
  hierarchy and meaningful status colors.
- Inspect computed foreground and the painted background, including translucent
  layers, ancestor opacity and artwork/gradients. Verify meaningful text/icon
  contrast, placeholder readability, selected/pressed distinction and keyboard
  focus. Do not claim contrast compliance from a foreground/background pair when
  images, gradients or compositing change what is painted.
- Measure visible distances and identify which element owns each inset. Parent
  gap plus child margin/padding can double a distance. Check baseline/center
  alignment, padding above/below wrapped copy, and equal roles on adjacent panels.
- Compare control height, icon size, avatar size, radius, border and surface tone.
  Use existing size variants and spacing tokens; fix isolated drift without making
  all rows or controls identical. Keep comfortable interactive hit areas even
  when the visible pill or icon is compact.
- Inspect hover/focus, selected/pressed, disabled/busy, validation, empty and
  loading states where existing stories/data provide them. Check narrow-width
  wrapping and scrolling rather than shrinking content to hide overflow.

## Dialogs, drawers and their content

Start at the shared dialog, drawer or sheet primitive (search the shared UI layer
for a `Dialog`/`Modal`/`Drawer`/`Sheet` component, a Radix, Headless UI, Ark or
vaul import, or `role="dialog"`) and trace the actual feature consumers. Open
dialogs through their controls and inspect the portal itself, including nested
overlays.

- Header: title/body hierarchy, muted description, close-button size and position,
  title/close alignment, and the top/side insets.
- Body: section/card/list/form padding, label/input/help spacing, validation colors,
  long copy, empty/error content, tab panels, separators and repeated row density.
  Compare the nested content, header/bar and feature padding before adding an
  inset; the title should align with the intended content column.
- Footer: separation from content, action sizes, disabled/busy appearance, primary
  versus secondary emphasis, wrapping and alignment on a phone.
- Geometry: appropriate width/max-height, a reachable scroll body, no horizontal
  overflow, and accessible controls at short viewport heights. Verify desktop
  dialog and mobile drawer formats independently when the feature provides both.
- Recheck Escape, focus trap/restoration, close/back and nested menu/picker behavior
  after changing layout. Inspect consequential confirmation/review screens up to
  the authorized boundary; do not submit them to obtain a screenshot.

## Lists and repeated items

Inspect friend/member/recipient lists, message lists, search/dropdown results,
product/market rows, settings navigation and other repeated card/row collections.

- Compare row height and vertical/horizontal padding with the amount of content.
  Include one-line and wrapped rows, short and long names, multiple metadata lines,
  optional badges, counts, selected/disabled items and inline actions.
- Check avatar/icon alignment with the text block, heading/body/metadata contrast,
  ellipsis only where intentional, and consistent separators and action gaps.
- On a phone, verify that required identity remains readable, action groups wrap
  deliberately, and variable-height rows do not overlap. Inspect the list/grid
  tracks as well as each row's styles.
- Compare compact navigation/menu rows and richer profile/message rows by role;
  a uniform CSS height across all lists is not a definition of balance.

## Global chat and related chat surfaces

Apply this section if the app has chat. A global or shell-level chat (a sidebar,
rail or drawer panel) often has no route of its own: find where the shell mounts
it and include the desktop sidebar and the mobile navigation/drawer format that
actually renders it. Inspect room, community and direct-message chat variants when
they are in scope.

- Distinguish author names, message body, mentions/links, timestamps and pending,
  failed or system messages by readable semantic colors and weights.
- Judge text size and line height with the rail's width, avatar/icon dimensions,
  avatar-to-body gap, message padding and spacing between messages. A compact chat
  should still allow names and multi-line messages to be read comfortably.
- Check wrapped messages/long names and URLs, loading/empty/offline states, input
  placeholder and entered text, send/emoji controls and scroll-to-latest affordances.
- Inspect chat against the surrounding navigation/panels so neither a large author
  label nor faint body copy dominates the wrong part of the shell. Preserve its
  scroll position and existing interaction behavior; no messages need to be sent.

## Comments, engagement controls and reactions

Apply this section if the app has comments or reactions. Start at the comment row
component, the comments feature and the shared action or engagement bar they use,
and inspect the real controls before assuming an emoji system: comments often use
Like/Reply/Share pills, while message emoji reactions, pickers and details may
live in a separate messaging feature.

- Compare author/body/metadata color and size, reply indentation, avatar dimensions,
  comment spacing, composer padding and the action bar's distance from the body.
- Review icon/emoji and count/label sizes, pill height/padding/gap, border/fill,
  alignment and wrapping. Check zero and multi-digit counts, long labels, nested
  replies and the same comment presentation in feeds, detail views and any other
  discussion surface where available.
- Inspect resting versus liked/pressed/selected, hover/focus, pending/disabled and
  failure appearance. Use existing stories or recorded states for visual variants
  rather than changing live reactions or submitting a comment to reach them.
- Keep deliberate compact defaults: read the shared action control's current size
  contract (visible height, icon size, label size) before resizing it; balance
  comes from readable proportions and surrounding spacing.
- Open existing emoji pickers and reaction-details overlays, inspect their items,
  selection/hover colors and insets, then close them without sending/reacting.

## Evidence and acceptance

Record typography, color, spacing, geometry/density and visual-state results for
each inventoried surface. Pair computed measurements with screenshots of the whole
surface at the same route/state/viewer/viewport before and after a fix. A numeric
font pass, a clean console or one shared story alone cannot establish visual finish.
Revisit affected consumers after a shared change and repeat the visual comparison
until the checked screens and their dialogs/lists/chats/comments look coherent.
Keep unvisited states, source-only review and consequential outcome gaps explicit.
