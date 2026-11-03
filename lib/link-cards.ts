export const LINK_CARD_CLASS = "link-card"

export interface LinkMetadata {
  title?: string
  description?: string
  image?: string
  favicon?: string
  siteName?: string
}

const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "LI", "UL", "OL"])

const REMOVE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

const safeHttpUrl = (value?: string) => (value && /^https?:\/\//i.test(value) ? value : undefined)

export function linkCardMarkdown(html: string): string {
  return html.replace(/<div class="link-card"[^>]*data-url="([^"]+)"[\s\S]*?<\/button><\/div>/g, "\n$1\n\n")
}

function buildCard(url: string, id: string): HTMLDivElement {
  const card = document.createElement("div")
  card.className = LINK_CARD_CLASS
  card.setAttribute("data-url", url)
  card.setAttribute("data-card-id", id)
  card.setAttribute("contenteditable", "false")
  card.setAttribute("data-loading", "true")

  const body = document.createElement("a")
  body.className = "link-card-body"
  body.href = url
  body.target = "_blank"
  body.rel = "noopener noreferrer"

  const thumb = document.createElement("span")
  thumb.className = "link-card-thumb"

  const text = document.createElement("span")
  text.className = "link-card-text"
  const title = document.createElement("span")
  title.className = "link-card-title"
  title.textContent = hostOf(url)
  const host = document.createElement("span")
  host.className = "link-card-url"
  host.textContent = url.replace(/^https?:\/\//i, "")
  text.append(title, host)

  body.append(thumb, text)

  const remove = document.createElement("button")
  remove.type = "button"
  remove.className = "link-card-remove"
  remove.setAttribute("aria-label", "Remove link preview")
  remove.innerHTML = REMOVE_ICON

  card.append(body, remove)
  return card
}

export function fillLinkCard(card: HTMLElement, meta: LinkMetadata | null) {
  card.removeAttribute("data-loading")
  const url = card.getAttribute("data-url") ?? ""
  const title = card.querySelector(".link-card-title")
  const thumb = card.querySelector(".link-card-thumb")
  if (title && meta?.title) title.textContent = meta.title
  const imageUrl = safeHttpUrl(meta?.image) ?? safeHttpUrl(meta?.favicon) ?? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostOf(url))}&sz=64`
  if (thumb) {
    thumb.textContent = ""
    thumb.classList.toggle("is-icon", !safeHttpUrl(meta?.image))
    const img = document.createElement("img")
    img.src = imageUrl
    img.alt = ""
    img.loading = "lazy"
    img.referrerPolicy = "no-referrer"
    thumb.appendChild(img)
  }
}

/** Marks links that were already in the note so only newly typed or pasted links get a card. */
export function markExistingLinks(root: HTMLElement) {
  root.querySelectorAll("a:not([data-card])").forEach((a) => {
    if (!a.closest(`.${LINK_CARD_CLASS}`)) a.setAttribute("data-card", "off")
  })
}

const isEmptyBlock = (el: Element) =>
  !el.textContent?.replace(/\u00a0/g, " ").trim() && !el.querySelector(`img, .${LINK_CARD_CLASS}`)

/** Removes a link that a card now represents, plus the line break and empty block it leaves behind. */
function removeCardedAnchor(root: HTMLElement, anchor: Element) {
  let host: Node = anchor
  while (host.parentNode && host.parentNode !== root && !BLOCK_TAGS.has((host.parentNode as Element).tagName)) {
    host = host.parentNode
  }
  const block = host.parentNode as HTMLElement | null
  const next = host.nextSibling
  const prev = host.previousSibling
  host.parentNode?.removeChild(host)
  if (next?.nodeName === "BR") next.parentNode?.removeChild(next)
  else if (prev?.nodeName === "BR" && !prev.nextSibling) prev.parentNode?.removeChild(prev)
  if (block && block !== root && isEmptyBlock(block)) block.remove()
}

/** Drops plain links that sit next to their own card (notes saved before cards replaced links). */
export function dedupeLinkCards(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(`.${LINK_CARD_CLASS}[data-card-id]`).forEach((card) => {
    const id = card.getAttribute("data-card-id")
    const anchor = id ? root.querySelector(`a[data-card="${CSS.escape(id)}"]`) : null
    if (anchor) removeCardedAnchor(root, anchor)
  })
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Static card markup for notes that store their main link outside the content (older link notes). */
export function linkCardHtml(url: string, meta: { title?: string; image?: string } = {}): string {
  const image = safeHttpUrl(meta.image) ?? (meta.image?.startsWith("/") && !meta.image.includes("placeholder") ? meta.image : undefined)
  const thumbSrc = image ?? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostOf(url))}&sz=64`
  const id = `main-${hostOf(url).replace(/[^a-z0-9]/gi, "")}`
  return (
    `<div class="${LINK_CARD_CLASS}" data-url="${escapeHtml(url)}" data-card-id="${id}" contenteditable="false">` +
    `<a class="link-card-body" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">` +
    `<span class="link-card-thumb${image ? "" : " is-icon"}"><img src="${escapeHtml(thumbSrc)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>` +
    `<span class="link-card-text"><span class="link-card-title">${escapeHtml(meta.title || hostOf(url))}</span>` +
    `<span class="link-card-url">${escapeHtml(url.replace(/^https?:\/\//i, ""))}</span></span></a>` +
    `<button type="button" class="link-card-remove" aria-label="Remove link preview">${REMOVE_ICON}</button></div>`
  )
}

/** Puts a card for the note's main link at the top of its content unless the content already has one. */
export function withMainLinkCard(html: string, url: string | undefined, meta: { title?: string; image?: string }) {
  if (!url || html.includes(`data-url="${escapeHtml(url)}"`) || html.includes('data-card-id="main-')) return html
  if (html.includes(`data-card-removed="${escapeHtml(url)}"`)) return html
  return linkCardHtml(url, meta) + (html.trim() ? html : "<p><br></p>")
}

/** Replaces each new link with a preview card on its own line and returns the inserted cards. */
export function attachLinkCards(root: HTMLElement): HTMLElement[] {
  const cards: HTMLElement[] = []
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]:not([data-card])")).filter(
    (a) => !a.closest(`.${LINK_CARD_CLASS}`) && /^https?:/i.test(a.href),
  )

  for (const anchor of anchors) {
    const id = Math.random().toString(36).slice(2, 10)
    anchor.setAttribute("data-card", id)
    const card = buildCard(anchor.href, id)

    let host: Node = anchor
    while (host.parentNode && host.parentNode !== root && !BLOCK_TAGS.has((host.parentNode as Element).tagName)) {
      host = host.parentNode
    }
    const block = host.parentNode as HTMLElement | null
    if (!block) continue

    let sibling: Node | null = host.nextSibling
    while (sibling && sibling.nodeName !== "BR") sibling = sibling.nextSibling
    const lineBreak = sibling as HTMLBRElement | null

    if (block === root) {
      root.insertBefore(card, lineBreak ? lineBreak.nextSibling : host.nextSibling)
      if (lineBreak) lineBreak.remove()
    } else if (block.parentNode === root && block.tagName === "P" && lineBreak?.nextSibling) {
      // Split the paragraph so the card sits directly under the link's own line.
      const rest = document.createElement("p")
      while (lineBreak.nextSibling) rest.appendChild(lineBreak.nextSibling)
      lineBreak.remove()
      block.after(card, rest)
    } else {
      let top: Node = block
      while (top.parentNode && top.parentNode !== root) top = top.parentNode
      ;(top as Element).after(card)
    }
    removeCardedAnchor(root, anchor)
    cards.push(card)
  }
  return cards
}

/** Turns a card back into a plain link on its own line and returns that line. */
export function removeLinkCard(root: HTMLElement, card: HTMLElement): HTMLElement {
  const url = card.getAttribute("data-url") ?? ""
  const line = document.createElement("p")
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.target = "_blank"
  anchor.rel = "noopener noreferrer"
  anchor.textContent = url
  anchor.setAttribute("data-card", "off")
  if (card.getAttribute("data-card-id")?.startsWith("main-")) line.setAttribute("data-card-removed", url)
  line.appendChild(anchor)
  if (root.contains(card)) card.replaceWith(line)
  return line
}
