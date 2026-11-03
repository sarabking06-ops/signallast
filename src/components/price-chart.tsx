import {
  ComposedChart,
  Customized,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import type { Candle } from "@/lib/market/types"

type Point = {
  i: number
  open: number
  high: number
  low: number
  close: number
  emotional: boolean
  swing: "low" | "high" | "both" | null
}

type Scale = (value: number) => number

type LayerProps = {
  xAxisMap?: Record<string, { scale: Scale }>
  yAxisMap?: Record<string, { scale: Scale }>
  data?: Point[]
}

function CandleLayer({ xAxisMap, yAxisMap, data }: LayerProps) {
  const xKey = xAxisMap ? Object.keys(xAxisMap)[0] : undefined
  const yKey = yAxisMap ? Object.keys(yAxisMap)[0] : undefined
  if (!xKey || !yKey || !xAxisMap || !yAxisMap || !data) return null
  const xScale = xAxisMap[xKey].scale
  const yScale = yAxisMap[yKey].scale
  const band = data.length > 1 ? Math.abs(xScale(1) - xScale(0)) : 8
  const bodyWidth = Math.max(2, Math.min(7, band * 0.62))

  return (
    <g>
      {data.map((point) => {
        const x = xScale(point.i)
        const yHigh = yScale(point.high)
        const yLow = yScale(point.low)
        const yOpen = yScale(point.open)
        const yClose = yScale(point.close)
        const up = point.close >= point.open
        const color = up ? "var(--color-buy)" : "var(--color-sell)"
        const top = Math.min(yOpen, yClose)
        const height = Math.max(1, Math.abs(yClose - yOpen))
        return (
          <g key={point.i}>
            <line
              x1={x}
              x2={x}
              y1={yHigh}
              y2={yLow}
              stroke={point.emotional ? "var(--color-fg)" : color}
              strokeWidth={point.emotional ? 1.5 : 1}
            />
            <rect
              x={x - bodyWidth / 2}
              y={top}
              width={bodyWidth}
              height={height}
              fill={point.emotional ? "transparent" : color}
              stroke={point.emotional ? "var(--color-fg)" : "none"}
            />
            {point.swing === "low" || point.swing === "both" ? (
              <circle cx={x} cy={yLow} r={2.5} fill="var(--color-fg)" />
            ) : null}
            {point.swing === "high" || point.swing === "both" ? (
              <circle cx={x} cy={yHigh} r={2.5} fill="var(--color-fg)" />
            ) : null}
          </g>
        )
      })}
    </g>
  )
}

export function PriceChart({
  candles,
  entry,
  stop,
  takeProfit,
  emotionalIndexes,
  swingLowIndex,
  swingHighIndex,
}: {
  candles: Candle[]
  entry?: number | null
  stop?: number | null
  takeProfit?: number | null
  emotionalIndexes?: number[]
  swingLowIndex?: number | null
  swingHighIndex?: number | null
}) {
  if (candles.length < 2) return null
  const emotional = new Set(emotionalIndexes ?? [])
  const data: Point[] = candles.map((candle, index) => {
    const lowMark = swingLowIndex === index
    const highMark = swingHighIndex === index
    const swing = lowMark && highMark ? "both" : lowMark ? "low" : highMark ? "high" : null
    return {
      i: index,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      emotional: emotional.has(index),
      swing,
    }
  })
  const levels = [stop, takeProfit, entry].filter((value): value is number => typeof value === "number")
  const min = Math.min(...data.map((point) => point.low), ...levels)
  const max = Math.max(...data.map((point) => point.high), ...levels)
  const pad = (max - min) * 0.08 || Math.abs(max) * 0.01 || 1

  return (
    <div className="h-36 w-full min-w-0" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="i" hide />
          <YAxis domain={[min - pad, max + pad]} hide />
          {typeof stop === "number" ? (
            <ReferenceLine y={stop} stroke="var(--color-sell)" strokeDasharray="4 3" strokeWidth={1} />
          ) : null}
          {typeof takeProfit === "number" ? (
            <ReferenceLine y={takeProfit} stroke="var(--color-buy)" strokeDasharray="4 3" strokeWidth={1} />
          ) : null}
          {typeof entry === "number" ? (
            <ReferenceLine y={entry} stroke="var(--color-muted)" strokeWidth={1} />
          ) : null}
          <Customized component={CandleLayer} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
