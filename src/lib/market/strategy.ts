import type { Analysis, Candle, Gate, SideEval } from "@/lib/market/types"

const WINDOW = 60
const PIVOT = 2

const emptySide = (): SideEval => ({
  gate: "no-swing",
  near: false,
  entry: null,
  stop: null,
  takeProfit: null,
})

export function analyze(candles: Candle[]): Analysis {
  const lastClose = candles.length ? candles[candles.length - 1].close : 0
  const base: Analysis = {
    signal: null,
    near: null,
    ambiguous: false,
    emotionalCount: 0,
    emotionalIndexes: [],
    swingLow: null,
    swingHigh: null,
    swingLowIndex: null,
    swingHighIndex: null,
    entry: null,
    stop: null,
    takeProfit: null,
    lastClose,
    buy: emptySide(),
    sell: emptySide(),
  }
  if (candles.length < WINDOW) return base

  const end = candles.length - 1
  const start = end - (WINDOW - 1)
  const ranges: number[] = []
  for (let i = start; i <= end; i++) {
    const range = candles[i].high - candles[i].low
    if (range > 0) ranges.push(range)
  }
  const avgRange = ranges.reduce((sum, value) => sum + value, 0) / Math.max(ranges.length, 1)

  const emotionalIndexes: number[] = []
  for (let i = start; i <= end; i++) {
    if (isEmotionalLongWick(candles[i], avgRange)) emotionalIndexes.push(i - start)
  }

  const swingLow = lowestSwing(candles, start, end, "low")
  const swingHigh = lowestSwing(candles, start, end, "high")
  const buy = evaluateSide(candles, end, avgRange, swingLow, "buy")
  const sell = evaluateSide(candles, end, avgRange, swingHigh, "sell")

  let signal: Analysis["signal"] = null
  let near: Analysis["near"] = null
  let ambiguous = false
  if (emotionalIndexes.length === 0) {
    if (buy.gate === "ok" && sell.gate === "ok") {
      ambiguous = true
    } else if (buy.gate === "ok") {
      signal = "buy"
    } else if (sell.gate === "ok") {
      signal = "sell"
    } else if (buy.near && !sell.near) {
      near = "buy"
    } else if (sell.near && !buy.near) {
      near = "sell"
    } else if (buy.near && sell.near) {
      near = closerSide(lastClose, swingLow?.price ?? null, swingHigh?.price ?? null)
    }
  }

  const chosen = signal === "buy" ? buy : signal === "sell" ? sell : null

  return {
    signal,
    near,
    ambiguous,
    emotionalCount: emotionalIndexes.length,
    emotionalIndexes,
    swingLow: swingLow?.price ?? null,
    swingHigh: swingHigh?.price ?? null,
    swingLowIndex: swingLow ? swingLow.index - start : null,
    swingHighIndex: swingHigh ? swingHigh.index - start : null,
    entry: chosen?.entry ?? null,
    stop: chosen?.stop ?? null,
    takeProfit: chosen?.takeProfit ?? null,
    lastClose,
    buy,
    sell,
  }
}

function closerSide(price: number, low: number | null, high: number | null): "buy" | "sell" | null {
  if (low == null && high == null) return null
  if (low == null) return "sell"
  if (high == null) return "buy"
  return Math.abs(price - low) <= Math.abs(price - high) ? "buy" : "sell"
}

type Swing = { index: number; price: number }

function lowestSwing(
  candles: Candle[],
  start: number,
  end: number,
  kind: "low" | "high",
): Swing | null {
  let best: Swing | null = null
  for (let i = Math.max(start, PIVOT); i <= end - PIVOT; i++) {
    if (!isSwing(candles, i, kind)) continue
    const price = kind === "low" ? candles[i].low : candles[i].high
    if (!best) {
      best = { index: i, price }
      continue
    }
    const better =
      kind === "low"
        ? price < best.price || (price === best.price && i > best.index)
        : price > best.price || (price === best.price && i > best.index)
    if (better) best = { index: i, price }
  }
  return best
}

function isSwing(candles: Candle[], index: number, kind: "low" | "high"): boolean {
  const price = kind === "low" ? candles[index].low : candles[index].high
  for (let k = 1; k <= PIVOT; k++) {
    const left = kind === "low" ? candles[index - k].low : candles[index - k].high
    const right = kind === "low" ? candles[index + k].low : candles[index + k].high
    if (kind === "low") {
      if (left < price || right < price) return false
    } else if (left > price || right > price) return false
  }
  const left1 = kind === "low" ? candles[index - 1].low : candles[index - 1].high
  const right1 = kind === "low" ? candles[index + 1].low : candles[index + 1].high
  return kind === "low" ? left1 > price || right1 > price : left1 < price || right1 < price
}

/**
 * Emotional long-wick candle: dominant shadow is at least twice the body and
 * half the range, and the shadow itself is larger than the 60-candle average range.
 */
export function isEmotionalLongWick(candle: Candle, avgRange: number): boolean {
  const range = candle.high - candle.low
  if (!(range > 0) || !(avgRange > 0)) return false
  const body = Math.abs(candle.close - candle.open)
  const upper = candle.high - Math.max(candle.open, candle.close)
  const lower = Math.min(candle.open, candle.close) - candle.low
  const wick = Math.max(upper, lower)
  const longShape = wick >= body * 2 && wick >= range * 0.5
  const outsized = wick >= avgRange * 1.15
  return longShape && outsized
}

function evaluateSide(
  candles: Candle[],
  end: number,
  avgRange: number,
  swing: Swing | null,
  side: "buy" | "sell",
): SideEval {
  if (!swing) return emptySide()
  const level = swing.price
  const last = candles[end]
  const prev = candles[end - 1]
  if (!prev) return { ...emptySide(), gate: "no-turn" }

  const departure = Math.max(avgRange * 0.75, level * 0.0012)
  let leftAt = -1
  for (let i = swing.index + 1; i <= end; i++) {
    const moved =
      side === "buy" ? candles[i].close >= level + departure : candles[i].close <= level - departure
    if (moved) {
      leftAt = i
      break
    }
  }
  if (leftAt < 0) return { ...emptySide(), gate: "no-departure" }

  const zonePad = avgRange * 0.45
  const pierce = avgRange * 0.22
  const zoneInner = side === "buy" ? level + zonePad : level - zonePad
  const zoneOuter = side === "buy" ? level - pierce : level + pierce
  const recentFrom = Math.max(leftAt + 1, end - 5)
  let touch = -1
  let pierced = false
  for (let i = recentFrom; i <= end; i++) {
    const candle = candles[i]
    const extreme = side === "buy" ? candle.low : candle.high
    const through = side === "buy" ? extreme < zoneOuter : extreme > zoneOuter
    if (through) pierced = true
    const tagged =
      side === "buy" ? extreme <= zoneInner && extreme >= zoneOuter : extreme >= zoneInner && extreme <= zoneOuter
    if (tagged) touch = i
  }
  if (pierced) return { ...emptySide(), gate: "broken" }

  const held = side === "buy" ? last.close > level : last.close < level
  const turning =
    side === "buy"
      ? held && last.close > prev.close && last.close >= last.open
      : held && last.close < prev.close && last.close <= last.open

  if (touch < 0) {
    const nearExtreme = side === "buy" ? last.low : last.high
    const extremeGap = side === "buy" ? nearExtreme - level : level - nearExtreme
    const closeGap = side === "buy" ? last.close - level : level - last.close
    const approaching = held && extremeGap >= -pierce && extremeGap <= avgRange * 0.8 && closeGap <= avgRange * 1.25
    return { ...emptySide(), gate: "no-pullback", near: approaching }
  }
  if (!turning) return { ...emptySide(), gate: "no-turn", near: held }

  const entry = last.close
  const risk = side === "buy" ? entry - level : level - entry
  if (!(risk > 0) || risk / entry < 0.00005) return { ...emptySide(), gate: "broken" }
  const takeProfit = side === "buy" ? entry + risk * 2 : entry - risk * 2
  return { gate: "ok", near: false, entry, stop: level, takeProfit }
}

export function rewardMultiple(entry: number | null, stop: number | null, takeProfit: number | null): number | null {
  if (entry == null || stop == null || takeProfit == null) return null
  const risk = Math.abs(entry - stop)
  const reward = Math.abs(takeProfit - entry)
  if (!(risk > 0)) return null
  return reward / risk
}

export function gateLabel(gate: Gate): string {
  switch (gate) {
    case "ok":
      return "شرط برقرار است"
    case "no-swing":
      return "سوینگ معتبری در ۶۰ کندل نیست"
    case "no-departure":
      return "قیمت بعد از سوینگ از سطح فاصله نگرفته"
    case "no-pullback":
      return "پولبک تازه به سوینگ ثبت نشده"
    case "no-turn":
      return "به سطح رسیده ولی برگشت قیمت تأیید نشده"
    case "broken":
      return "سطح سوینگ شکسته شده"
    default:
      return ""
  }
}
