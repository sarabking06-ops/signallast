export type IntervalId = "1h" | "4h" | "1d"

export type Side = "buy" | "sell"

export type Gate =
  | "ok"
  | "no-swing"
  | "no-departure"
  | "no-pullback"
  | "no-turn"
  | "broken"

export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export type SideEval = {
  gate: Gate
  near: boolean
  entry: number | null
  stop: number | null
  takeProfit: number | null
}

export type Analysis = {
  signal: Side | null
  near: Side | null
  ambiguous: boolean
  emotionalCount: number
  emotionalIndexes: number[]
  swingLow: number | null
  swingHigh: number | null
  swingLowIndex: number | null
  swingHighIndex: number | null
  entry: number | null
  stop: number | null
  takeProfit: number | null
  lastClose: number
  buy: SideEval
  sell: SideEval
}

export type Coin = {
  id: string
  symbol: string
  pair: string
  name: string
  rank: number
  image: string
  change24h: number
}

export type ScanRow = {
  pair: string
  ok: boolean
  analysis: Analysis | null
  candles: Candle[]
}
