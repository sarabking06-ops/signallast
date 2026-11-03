import { createServerFn } from "@tanstack/react-start"
import type { Coin, IntervalId, ScanRow } from "@/lib/market/types"

export const getUniverse = createServerFn({ method: "GET" }).handler(async (): Promise<{ coins: Coin[] }> => {
  const { loadUniverse } = await import("@/lib/market/market-data")
  const coins = await loadUniverse(false)
  return { coins }
})

export const scanSymbols = createServerFn({ method: "POST" })
  .validator((data: { interval: string; pairs: string[]; fresh?: boolean }) => data)
  .handler(async ({ data }): Promise<{ rows: ScanRow[] }> => {
    const { isIntervalId, sanitizePairs, scanPairs } = await import("@/lib/market/market-data")
    if (!isIntervalId(data.interval)) throw new Error("تایم‌فریم نامعتبر است")
    const interval: IntervalId = data.interval
    const pairs = sanitizePairs(data.pairs)
    const rows = await scanPairs(pairs, interval, Boolean(data.fresh))
    return { rows }
  })
