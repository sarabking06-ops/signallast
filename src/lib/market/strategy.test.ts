import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { analyze, isEmotionalLongWick } from "./strategy.ts"
import type { Candle } from "./types.ts"

function smooth(closes: number[], wick = 0.12): Candle[] {
  return closes.map((close, index) => {
    const open = index === 0 ? close - 0.2 : closes[index - 1]
    return {
      time: index * 3_600_000,
      open,
      close,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick,
    }
  })
}

function buyPath(): number[] {
  const closes = Array.from({ length: 70 }, () => 112)
  for (let i = 18; i <= 22; i++) closes[i] = [110, 106, 100.8, 105, 109][i - 18]
  for (let i = 23; i <= 45; i++) closes[i] = 109 + ((130 - 109) * (i - 23)) / 22
  for (let i = 46; i <= 66; i++) closes[i] = 130 - ((130 - 100.55) * (i - 46)) / 20
  closes[67] = 101.3
  closes[68] = 102.15
  closes[69] = 103.2
  return closes
}

describe("swing radar", () => {
  it("buys a clean pullback to the lowest swing low that turns up", () => {
    const candles = smooth(buyPath())
    candles[20] = {
      time: candles[20].time,
      open: 105,
      close: 100.7,
      high: 105.2,
      low: 100,
    }
    const result = analyze(candles)
    assert.equal(result.emotionalCount, 0)
    assert.equal(result.signal, "buy")
    assert.ok(result.entry && result.stop && result.takeProfit)
    assert.equal(result.stop, 100)
    assert.ok(result.entry > result.stop)
    const risk = result.entry - result.stop
    assert.ok(Math.abs(result.takeProfit - (result.entry + risk * 2)) < 1e-8)
  })

  it("sells a clean pullback to the highest swing high that turns down", () => {
    const candles = smooth(buyPath().map((price) => 220 - price))
    const bar = candles[20]
    candles[20] = {
      time: bar.time,
      open: 220 - 105,
      close: 220 - 100.7,
      low: 220 - 105.2,
      high: 220 - 100,
    }
    const result = analyze(candles)
    assert.equal(result.emotionalCount, 0)
    assert.equal(result.signal, "sell")
    assert.equal(result.stop, 120)
    assert.ok(result.entry && result.takeProfit && result.stop)
    assert.ok(result.entry < result.stop)
    const risk = result.stop - result.entry
    assert.ok(Math.abs(result.entry - risk * 2 - result.takeProfit) < 1e-6)
  })

  it("blocks an otherwise valid buy when a long emotional wick is present", () => {
    const candles = smooth(buyPath())
    candles[20] = {
      time: candles[20].time,
      open: 105,
      close: 100.7,
      high: 105.2,
      low: 100,
    }
    candles[40] = {
      time: candles[40].time,
      open: 120,
      close: 120.4,
      high: 128,
      low: 119.8,
    }
    const result = analyze(candles)
    assert.ok(result.emotionalCount >= 1)
    assert.equal(result.signal, null)
    assert.equal(result.buy.gate, "ok")
  })

  it("flags a long outsized wick and ignores an ordinary candle", () => {
    const ordinary: Candle = { time: 0, open: 10, close: 10.4, high: 10.55, low: 9.9 }
    const spike: Candle = { time: 0, open: 10, close: 10.2, high: 14, low: 9.9 }
    assert.equal(isEmotionalLongWick(ordinary, 1), false)
    assert.equal(isEmotionalLongWick(spike, 1), true)
  })
})
