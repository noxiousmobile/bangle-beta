/**
 * Detects if the provided text is a URL
 * Uses a very strict pattern to avoid false positives
 */
export function isUrl(text: string): boolean {
  // First, clean the text
  const trimmedText = text.trim()

  // If it already contains http:// or https://, it's likely a URL
  if (trimmedText.match(/^https?:\/\//i)) {
    try {
      new URL(trimmedText)
      return true
    } catch (e) {
      return false
    }
  }

  // Check for domain-like pattern with TLD
  // This is a much stricter check that requires a valid domain structure
  const domainPattern = /^(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/i

  if (domainPattern.test(trimmedText)) {
    try {
      new URL(`https://${trimmedText}`)
      return true
    } catch (e) {
      return false
    }
  }

  return false
}

/**
 * Ensures a URL has a protocol
 */
export function ensureUrlProtocol(url: string): string {
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`
  }
  return url
}
