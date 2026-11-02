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

/** Inserts a preview card below each new link's line and returns the inserted cards. */
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
    cards.push(card)
  }
  return cards
}

/** Removes a card and leaves its link as plain text in the note. */
export function removeLinkCard(root: HTMLElement, card: HTMLElement) {
  const id = card.getAttribute("data-card-id")
  if (id) root.querySelector(`a[data-card="${CSS.escape(id)}"]`)?.setAttribute("data-card", "off")
  card.remove()
}
