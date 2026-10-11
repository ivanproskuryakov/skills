// Read-only expression for a supported browser evaluation API.
// Invoke with { scope: '[role="dialog"],[role="alertdialog"]', limit: 250 } for an open overlay.
// For an API evaluating a JavaScript string, call the expression explicitly:
// '(' + source + ')({scope:"body",limit:400})'. Passing its definition alone returns no snapshot.
// The default body scope includes portals and layout containers. For a compact pass,
// use includeContainers: false or kinds: ['text', 'control', 'icon', 'media'].
// Follow nextOffset to collect a bounded snapshot completely. Returned selectors
// are location hints, not stable interaction locators. aria-hidden does not mean
// visually hidden: decorative icons and modal backgrounds remain measurable.
// Paint/opacity context and clipping flags need visual verification; this expression
// does not calculate contrast compliance over images, gradients or translucent layers.
(options = {}) => {
  const scope = options.scope || 'body'
  const limit = Math.min(3000, Math.max(1, Math.floor(Number(options.limit) || 400)))
  const requestedOffset = Number(options.offset)
  const offset = Number.isFinite(requestedOffset) ? Math.max(0, Math.floor(requestedOffset)) : 0
  const includeContainers = options.includeContainers !== false
  const kinds = Array.isArray(options.kinds) ? new Set(options.kinds) : null
  const bounded = (value, length = 500) => value?.slice(0, length)
  const styles = new Map()
  const computed = (element) => {
    if (!styles.has(element)) styles.set(element, getComputedStyle(element))
    return styles.get(element)
  }
  const visible = (element) => {
    const rect = element.getBoundingClientRect()
    const style = computed(element)
    if (rect.width <= 0 || rect.height <= 0 || style.display === 'none' ||
      style.visibility === 'hidden' || style.visibility === 'collapse') return false
    for (let current = element; current; current = current.parentElement) {
      const ancestorStyle = computed(current)
      if (ancestorStyle.display === 'none' || ancestorStyle.contentVisibility === 'hidden' ||
        Number(ancestorStyle.opacity) === 0) return false
    }
    return true
  }
  const bounds = (element) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  }
  const spacing = (style) => ({
    margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft],
    padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
    rowGap: style.rowGap,
    columnGap: style.columnGap,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
  })
  const location = (element) => {
    const parts = []
    let current = element
    while (current && parts.length < 5) {
      const tag = current.tagName.toLowerCase()
      const siblings = current.parentElement
        ? [...current.parentElement.children].filter((child) => child.tagName === current.tagName)
        : [current]
      parts.unshift(tag + (siblings.length > 1 ? ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')' : ''))
      current = current.parentElement
    }
    return parts.join(' > ')
  }
  const directText = (element) => [...element.childNodes].some((node) =>
    node.nodeType === 3 && node.textContent?.trim())
  const kind = (element) => {
    const tag = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    if (['dialog', 'alertdialog', 'menu', 'tooltip'].includes(role) || tag === 'dialog') return 'overlay'
    if (tag === 'svg') return 'icon'
    if (['img', 'picture', 'video', 'canvas'].includes(tag)) return 'media'
    if (['button', 'a', 'input', 'textarea', 'select', 'summary'].includes(tag) ||
      ['button', 'link', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'checkbox',
        'radio', 'switch', 'combobox', 'slider', 'spinbutton', 'textbox'].includes(role)) return 'control'
    if (['ul', 'ol', 'dl', 'table', 'tbody', 'thead'].includes(tag) ||
      ['list', 'listbox', 'log', 'grid', 'tree', 'tablist'].includes(role)) return 'list'
    if (['li', 'tr'].includes(tag) || ['listitem', 'option', 'row', 'treeitem'].includes(role)) return 'list-item'
    if (['div', 'span'].includes(tag) && !directText(element) && element.children.length) return 'container'
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'b', 'small', 'em', 'i',
      'code', 'blockquote', 'figcaption', 'legend', 'label', 'dt', 'dd', 'th', 'td'].includes(tag) ||
      directText(element)) return 'text'
    return 'container'
  }
  const paint = (style) => ({
    color: style.color,
    backgroundColor: style.backgroundColor,
    backgroundImage: bounded(style.backgroundImage),
    backgroundImageTruncated: style.backgroundImage?.length > 500,
    opacity: style.opacity,
    filter: bounded(style.filter, 200),
    backdropFilter: bounded(style.backdropFilter, 200),
  })
  const transparent = (color) => color === 'transparent' || /(?:,\s*0\s*\)|\/\s*0(?:%|\s)*\))$/.test(color)
  const paintContext = (element) => {
    const ancestors = []
    let effectiveOpacity = 1
    let matchingAncestors = 0
    for (let current = element; current; current = current.parentElement) {
      const style = computed(current)
      effectiveOpacity *= Number(style.opacity)
      if (current === element) continue
      if (!transparent(style.backgroundColor) || style.backgroundImage !== 'none' ||
        Number(style.opacity) < 1 || (style.filter && style.filter !== 'none') ||
        (style.backdropFilter && style.backdropFilter !== 'none')) {
        matchingAncestors += 1
        if (ancestors.length < 6) ancestors.push({ location: location(current), ...paint(style) })
      }
    }
    return { effectiveOpacity, ancestors, truncated: matchingAncestors > ancestors.length }
  }
  const borderSides = ['Top', 'Right', 'Bottom', 'Left']
  const visual = (style) => ({
    ...paint(style),
    borders: borderSides.map((side) => ({
      width: style['border' + side + 'Width'],
      style: style['border' + side + 'Style'],
      color: style['border' + side + 'Color'],
    })),
    radii: [style.borderTopLeftRadius, style.borderTopRightRadius,
      style.borderBottomRightRadius, style.borderBottomLeftRadius],
    boxShadow: bounded(style.boxShadow),
    outline: { width: style.outlineWidth, style: style.outlineStyle,
      color: style.outlineColor, offset: style.outlineOffset },
  })
  const stateAttributes = ['aria-hidden', 'aria-modal', 'aria-current', 'aria-disabled', 'aria-busy',
    'aria-expanded', 'aria-pressed', 'aria-selected', 'aria-checked', 'aria-invalid',
    'data-state', 'data-size', 'data-variant', 'data-tone', 'data-pending', 'data-depth',
    'data-social', 'data-highlighted', 'data-liked', 'data-loading', 'data-disabled']
  const states = (element) => ({
    attributes: Object.fromEntries(stateAttributes.filter((name) => element.hasAttribute(name))
      .map((name) => [name, bounded(element.getAttribute(name), 100)])),
    focused: element === document.activeElement,
    focusVisible: element.matches(':focus-visible'),
    focusWithin: element.contains(document.activeElement),
    hovered: element.matches(':hover'),
    disabled: element.matches(':disabled'),
    checked: 'checked' in element ? element.checked : undefined,
    readOnly: 'readOnly' in element ? element.readOnly : undefined,
    cursor: computed(element).cursor,
    pointerEvents: computed(element).pointerEvents,
  })
  const selector = 'body,main,section,article,aside,header,footer,nav,form,fieldset,figure,dialog,' +
    'h1,h2,h3,h4,h5,h6,p,span,strong,b,small,em,i,code,blockquote,figcaption,summary,legend,' +
    'div,a,button,input,textarea,select,label,dt,dd,th,td,li,ul,ol,dl,table,tbody,thead,tr,' +
    'img,picture,svg,video,canvas,[role]'
  const elements = new Set()
  for (const root of document.querySelectorAll(scope)) {
    elements.add(root)
    for (const element of root.querySelectorAll(selector)) elements.add(element)
  }
  const rowKinds = new Map()
  const candidates = [...elements].filter((element) => {
    if (!visible(element)) return false
    const rowKind = kind(element)
    rowKinds.set(element, rowKind)
    return (includeContainers || rowKind !== 'container') && (!kinds || kinds.has(rowKind))
  })
  const rows = candidates.slice(offset, offset + limit).map((element) => {
    const style = computed(element)
    const parent = element.parentElement
    const tag = element.tagName.toLowerCase()
    const box = bounds(element)
    return {
      location: location(element),
      id: element.id || null,
      className: element.getAttribute('class')?.slice(0, 160) || null,
      kind: rowKinds.get(element),
      tag,
      role: element.getAttribute('role'),
      text: (element.textContent?.trim() || element.getAttribute('placeholder') ||
        element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 100),
      font: {
        family: bounded(style.fontFamily, 200), size: style.fontSize, weight: style.fontWeight,
        lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
      },
      wrapping: { whiteSpace: style.whiteSpace, wordBreak: style.wordBreak,
        overflowWrap: style.overflowWrap, textOverflow: style.textOverflow,
        lineClamp: style.webkitLineClamp },
      box,
      spacing: spacing(style),
      parent: parent ? { location: location(parent), box: bounds(parent),
        spacing: spacing(computed(parent)) } : null,
      visual: visual(style),
      paintContext: paintContext(element),
      layout: { display: style.display, position: style.position, boxSizing: style.boxSizing,
        minWidth: style.minWidth, maxWidth: style.maxWidth, minHeight: style.minHeight,
        maxHeight: style.maxHeight, gridColumns: bounded(style.gridTemplateColumns),
        gridRows: bounded(style.gridTemplateRows), flexDirection: style.flexDirection,
        flexWrap: style.flexWrap, alignSelf: style.alignSelf },
      scroll: { clientWidth: element.clientWidth, clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight,
        left: element.scrollLeft, top: element.scrollTop,
        overflowX: style.overflowX, overflowY: style.overflowY },
      inViewport: box.x + box.width > 0 && box.y + box.height > 0 &&
        box.x < document.documentElement.clientWidth && box.y < document.documentElement.clientHeight,
      media: ['img', 'picture', 'svg', 'video', 'canvas'].includes(tag)
        ? { width: box.width, height: box.height, objectFit: style.objectFit,
          objectPosition: style.objectPosition, viewBox: element.getAttribute('viewBox'),
          naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight,
          fill: style.fill, stroke: style.stroke, strokeWidth: style.strokeWidth } : null,
      states: states(element),
      clippingCandidate: element.clientWidth > 0 &&
        (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1),
    }
  })
  return {
    title: document.title,
    scope,
    viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    matchingElements: candidates.length,
    offset,
    limit,
    truncated: offset > 0 || offset + rows.length < candidates.length,
    nextOffset: offset + rows.length < candidates.length ? offset + rows.length : null,
    kindCounts: candidates.reduce((counts, element) => {
      const rowKind = rowKinds.get(element)
      counts[rowKind] = (counts[rowKind] || 0) + 1
      return counts
    }, {}),
    interpretation: 'Rendered boxes and computed paint are observations, not contrast or clipping verdicts; inspect screenshots, image/gradient layers and interaction states.',
    rows,
  }
}
