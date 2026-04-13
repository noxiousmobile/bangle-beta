// Function to abbreviate date strings for mobile
export const abbreviateDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A"

  // Handle special case for "Yesterday"
  if (dateString === "Yesterday") return "1d"

  // Extract the numeric part and the time unit
  const match = dateString.match(/(\d+)\s+(\w+)/)
  if (!match) return dateString

  const [, number, unit] = match

  // Map time units to their abbreviated forms
  const unitMap: Record<string, string> = {
    minute: "min",
    minutes: "min",
    hour: "h",
    hours: "h",
    day: "d",
    days: "d",
    week: "w",
    weeks: "w",
    month: "mo",
    months: "mo",
    year: "y",
    years: "y",
  }

  const abbreviatedUnit = unitMap[unit.toLowerCase()]
  if (!abbreviatedUnit) return dateString

  // Return the abbreviated format without "ago"
  return `${number}${abbreviatedUnit}`
}
