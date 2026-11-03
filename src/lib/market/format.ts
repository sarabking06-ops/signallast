export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  let digits = 2
  if (abs < 100) digits = 3
  if (abs < 10) digits = 4
  if (abs < 1) digits = 5
  if (abs < 0.1) digits = 6
  if (abs < 0.01) digits = 7
  if (abs < 0.001) digits = 8
  if (abs < 0.0001) digits = 10
  return value.toLocaleString("en-US", {
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  })
}

export function formatPct(value: number, signed = false): string {
  if (!Number.isFinite(value)) return "—"
  const text = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (!signed) return `${value < 0 ? "−" : ""}${text}%`
  if (value > 0) return `+${text}%`
  if (value < 0) return `−${text}%`
  return `${text}%`
}

export function formatWhen(time: number): string {
  if (!time) return "—"
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(time))
}
