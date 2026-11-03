import { useEffect, useMemo, useRef, useState } from "react"
import { Check, RefreshCw, Search } from "lucide-react"
import { PriceChart } from "@/components/price-chart"
import { formatPct, formatPrice, formatWhen } from "@/lib/market/format"
import { gateLabel } from "@/lib/market/strategy"
import { getUniverse, scanSymbols } from "@/lib/market/scan"
import type { Analysis, Coin, Gate, IntervalId, ScanRow, Side } from "@/lib/market/types"

const INTERVALS: { id: IntervalId; label: string }[] = [
  { id: "1h", label: "۱ ساعته" },
  { id: "4h", label: "۴ ساعته" },
  { id: "1d", label: "روزانه" },
]

const GATE_RANK: Record<Gate, number> = {
  ok: 6,
  "no-turn": 5,
  "no-pullback": 4,
  "no-departure": 3,
  broken: 2,
  "no-swing": 1,
}

type Phase = "list" | "scan" | "done" | "error"
type View = "setups" | "all"

type Joined = { coin: Coin; scan?: ScanRow }

export function Scanner() {
  const [interval, setInterval] = useState<IntervalId>("4h")
  const [view, setView] = useState<View>("setups")
  const [query, setQuery] = useState("")
  const [coins, setCoins] = useState<Coin[]>([])
  const [rows, setRows] = useState<Record<string, ScanRow>>({})
  const [phase, setPhase] = useState<Phase>("list")
  const [done, setDone] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const [openPair, setOpenPair] = useState<string | null>(null)
  const freshRef = useRef(false)
  const runRef = useRef(0)

  useEffect(() => {
    const runId = ++runRef.current
    const fresh = freshRef.current
    freshRef.current = false
    const controller = { cancelled: false }

    async function run() {
      setPhase("list")
      setError(null)
      setRows({})
      setDone(0)
      setOpenPair(null)
      try {
        const universe = await getUniverse()
        if (controller.cancelled || runId !== runRef.current) return
        setCoins(universe.coins)
        setPhase("scan")
        const batches: Coin[][] = []
        for (let index = 0; index < universe.coins.length; index += 8) {
          batches.push(universe.coins.slice(index, index + 8))
        }
        let cursor = 0
        let finished = 0
        async function worker() {
          for (;;) {
            const index = cursor++
            if (index >= batches.length) return
            const batch = batches[index]
            try {
              const result = await scanSymbols({
                data: { interval, pairs: batch.map((coin) => coin.pair), fresh },
              })
              if (controller.cancelled || runId !== runRef.current) return
              finished += batch.length
              setDone(finished)
              setRows((current) => {
                const next = { ...current }
                for (const row of result.rows) next[row.pair] = row
                return next
              })
            } catch {
              if (controller.cancelled || runId !== runRef.current) return
              finished += batch.length
              setDone(finished)
            }
          }
        }
        await Promise.all([worker(), worker(), worker()])
        if (!controller.cancelled && runId === runRef.current) setPhase("done")
      } catch (cause) {
        if (controller.cancelled || runId !== runRef.current) return
        setPhase("error")
        setError(cause instanceof Error && cause.message ? cause.message : "اسکن بازار انجام نشد")
      }
    }

    void run()
    return () => {
      controller.cancelled = true
    }
  }, [interval, nonce])

  const joined = useMemo<Joined[]>(
    () => coins.map((coin) => ({ coin, scan: rows[coin.pair] })),
    [coins, rows],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return joined
    return joined.filter(({ coin }) => {
      return (
        coin.symbol.toLowerCase().includes(needle) ||
        coin.name.toLowerCase().includes(needle) ||
        coin.pair.toLowerCase().includes(needle)
      )
    })
  }, [joined, query])

  const signals = filtered.filter((row) => row.scan?.analysis?.signal)
  const nears = filtered.filter((row) => row.scan?.analysis?.near && !row.scan.analysis.signal)
  const buyCount = filtered.filter((row) => row.scan?.analysis?.signal === "buy").length
  const sellCount = filtered.filter((row) => row.scan?.analysis?.signal === "sell").length
  const busy = phase === "list" || phase === "scan"
  const progress = coins.length ? Math.min(100, Math.round((done / coins.length) * 100)) : 0

  function refresh() {
    if (busy) return
    freshRef.current = true
    setNonce((value) => value + 1)
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">اسپات · ۱۰۰ ارز برتر</p>
            <h1 className="text-2xl font-semibold tracking-tight">رادار سوینگ</h1>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-medium text-bg disabled:opacity-60"
          >
            <RefreshCw className={busy ? "size-4 animate-spin motion-reduce:animate-none" : "size-4"} />
            بروزرسانی
          </button>
        </div>
        <p className="max-w-3xl text-sm text-muted">
          اگر ۶۰ کندل آخر سایه هیجانی بلند نداشته باشد، قیمت به پایین‌ترین سوینگ لو پولبک بزند و برگردد بالا، خرید
          است. آینه آن روی بالاترین سوینگ های، فروش است. حد ضرر روی همان سوینگ می‌نشیند و هدف دو برابر ریسک است.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid h-11 grid-cols-3 rounded-lg border border-border bg-surface p-1 sm:w-80">
            {INTERVALS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={interval === item.id}
                onClick={() => setInterval(item.id)}
                className={
                  interval === item.id
                    ? "rounded-md bg-fg text-sm font-medium text-bg"
                    : "rounded-md text-sm text-muted"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">جستجوی ارز</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجوی نماد یا نام"
              suppressHydrationWarning
              className="h-11 w-full rounded-lg border border-border bg-surface ps-10 pe-3 text-sm text-fg placeholder:text-subtle"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="خرید" value={String(buyCount)} />
          <Stat label="فروش" value={String(sellCount)} />
          <Stat label="نزدیک ستاپ" value={String(nears.length)} />
          <Stat label="پیشرفت" value={coins.length ? `${done}/${coins.length}` : "—"} />
        </div>
        {busy ? (
          <div className="h-1 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
            <div className="progress-fill h-full bg-fg" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        <div className="grid h-11 grid-cols-2 rounded-lg border border-border bg-surface p-1 sm:w-72">
          <button
            type="button"
            aria-pressed={view === "setups"}
            onClick={() => setView("setups")}
            className={view === "setups" ? "rounded-md bg-elevated text-sm font-medium text-fg" : "rounded-md text-sm text-muted"}
          >
            سیگنال‌ها
          </button>
          <button
            type="button"
            aria-pressed={view === "all"}
            onClick={() => setView("all")}
            className={view === "all" ? "rounded-md bg-elevated text-sm font-medium text-fg" : "rounded-md text-sm text-muted"}
          >
            همه ارزها
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-3xl border border-border bg-surface p-4 text-sm text-sell" role="alert">
          {error}
        </p>
      ) : null}

      {phase === "list" ? <SkeletonList /> : null}

      {view === "setups" && phase !== "list" ? (
        <section className="flex flex-col gap-6">
          <SignalGroup title="موقعیت‌های باز" rows={signals} empty={phase === "done" ? "در این تایم‌فریم ستاپ کامل پیدا نشد." : "در حال خواندن کندل‌ها…"} />
          <SignalGroup title="نزدیک به ستاپ" rows={nears} empty={phase === "done" ? "مورد نزدیکی با ساختار پاک نیست." : "نزدیک‌ها بعد از اتمام هر دسته می‌آیند."} />
        </section>
      ) : null}

      {view === "all" && phase !== "list" ? (
        <AllTable rows={filtered} openPair={openPair} onToggle={setOpenPair} pending={phase === "scan"} />
      ) : null}

      <details className="rounded-3xl border border-border bg-surface p-4">
        <summary className="text-sm font-medium">منطق دقیق سیگنال</summary>
        <div className="mt-3 flex max-w-3xl flex-col gap-3 text-sm text-muted">
          <p>پنجره بررسی، ۶۰ کندل آخر تایم‌فریم انتخاب‌شده است. سوینگ با دو کندل در هر طرف تأیید می‌شود.</p>
          <p>
            کندل هیجانی با سایه بلند: سایه غالب حداقل دو برابر بدنه و نصف طول کندل باشد، و خود سایه از میانگین دامنه
            همین ۶۰ کندل بلندتر باشد. اگر حتی یکی از این کندل‌ها در پنجره باشد، سیگنال صادر نمی‌شود.
          </p>
          <p>
            خرید: قیمت بعد از پایین‌ترین سوینگ لو از آن فاصله گرفته باشد، در کندل‌های اخیر به همان کف برگشته باشد،
            بسته آخر بالای سطح و صعودی باشد. فروش آینه همین شرایط روی بالاترین سوینگ های است.
          </p>
          <p>
            حد ضرر خرید روی پایین‌ترین سوینگ لو است و حد ضرر فروش روی بالاترین سوینگ های؛ یعنی پشت ورود و خلاف جهت
            معامله. هدف طوری گذاشته می‌شود که سود همیشه دو برابر فاصله ورود تا حد ضرر باشد.
          </p>
          <p>داده قیمت از بازار اسپات تتر است. این صفحه ابزار بررسی ستاپ است، نه توصیه خرید یا فروش.</p>
        </div>
      </details>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold tabular-nums" dir="ltr">
        {value}
      </p>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-64 rounded-3xl border border-border bg-surface motion-safe:animate-pulse" />
      ))}
    </div>
  )
}

function SignalGroup({ title, rows, empty }: { title: string; rows: Joined[]; empty: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-3xl border border-border bg-surface px-4 py-6 text-sm text-muted">{empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <SetupCard key={row.coin.pair} row={row} />
          ))}
        </div>
      )}
    </section>
  )
}

function SetupCard({ row }: { row: Joined }) {
  const analysis = row.scan?.analysis
  if (!analysis) return null
  const side = analysis.signal ?? analysis.near
  if (!side) return null
  const confirmed = Boolean(analysis.signal)
  const level = side === "buy" ? analysis.swingLow : analysis.swingHigh
  const riskPct =
    analysis.entry != null && analysis.stop != null ? (Math.abs(analysis.entry - analysis.stop) / analysis.entry) * 100 : null
  const rewardPct =
    analysis.entry != null && analysis.takeProfit != null
      ? (Math.abs(analysis.takeProfit - analysis.entry) / analysis.entry) * 100
      : null
  const last = row.scan?.candles[row.scan.candles.length - 1]

  return (
    <article className="rise-in flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CoinMark image={row.coin.image} symbol={row.coin.symbol} />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold">{row.coin.symbol}</h3>
              <span className="truncate text-xs text-muted">{row.coin.name}</span>
            </div>
            <p className="text-xs text-subtle">رتبه {row.coin.rank || "—"}</p>
          </div>
        </div>
        <SideBadge side={side} confirmed={confirmed} />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">قیمت</p>
          <p className="text-base font-semibold tabular-nums" dir="ltr">
            {formatPrice(analysis.lastClose)}
          </p>
        </div>
        <p className={row.coin.change24h >= 0 ? "text-sm tabular-nums text-buy" : "text-sm tabular-nums text-sell"} dir="ltr">
          {formatPct(row.coin.change24h, true)}
          <span className="ms-1 text-xs text-subtle">۲۴س</span>
        </p>
      </div>

      {confirmed ? (
        <dl className="grid grid-cols-3 gap-2">
          <Level label="ورود" value={formatPrice(analysis.entry ?? 0)} />
          <Level label="حد ضرر" value={formatPrice(analysis.stop ?? 0)} />
          <Level label="هدف" value={formatPrice(analysis.takeProfit ?? 0)} />
        </dl>
      ) : (
        <dl className="grid grid-cols-2 gap-2">
          <Level label={side === "buy" ? "سوینگ لو" : "سوینگ های"} value={level == null ? "—" : formatPrice(level)} />
          <Level label="فاصله" value={level == null ? "—" : formatPct(((side === "buy" ? analysis.lastClose - level : level - analysis.lastClose) / analysis.lastClose) * 100)} />
        </dl>
      )}

      {confirmed && riskPct != null && rewardPct != null ? (
        <p className="text-xs text-muted">
          ریسک <Num>{formatPct(riskPct)}</Num>
          <span className="px-1 text-subtle">·</span>
          سود <Num>{formatPct(rewardPct)}</Num>
          <span className="px-1 text-subtle">·</span>
          نسبت <Num>1:2</Num>
        </p>
      ) : (
        <p className="text-xs text-muted">{side === "buy" ? gateLabel(analysis.buy.gate) : gateLabel(analysis.sell.gate)}</p>
      )}

      <PriceChart
        candles={row.scan?.candles ?? []}
        entry={confirmed ? analysis.entry : analysis.lastClose}
        stop={confirmed ? analysis.stop : level}
        takeProfit={confirmed ? analysis.takeProfit : null}
        emotionalIndexes={analysis.emotionalIndexes}
        swingLowIndex={analysis.swingLowIndex}
        swingHighIndex={analysis.swingHighIndex}
      />

      {confirmed ? (
        <ul className="flex flex-col gap-1 text-xs text-muted">
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-fg" />
            ۶۰ کندل بدون سایه هیجانی بلند
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-fg" />
            {side === "buy" ? "پولبک به پایین‌ترین سوینگ لو" : "پولبک به بالاترین سوینگ های"}
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-3.5 text-fg" />
            {side === "buy" ? "برگشت قیمت به سمت بالا" : "برگشت قیمت به سمت پایین"}
          </li>
        </ul>
      ) : null}

      {last ? (
        <p className="text-xs text-subtle">
          آخرین کندل <Num>{formatWhen(last.time)}</Num>
        </p>
      ) : null}

      {confirmed ? <ChartKey /> : null}
    </article>
  )
}

function ChartKey() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-subtle">
      <span className="inline-flex items-center gap-1">
        <i className="inline-block h-px w-4 bg-muted" />
        ورود
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="inline-block h-px w-4 bg-sell" />
        حد ضرر
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="inline-block h-px w-4 bg-buy" />
        هدف
      </span>
    </div>
  )
}

function Level({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-elevated px-2 py-2">
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className="text-sm font-medium tabular-nums" dir="ltr">
        {value}
      </dd>
    </div>
  )
}

function SideBadge({ side, confirmed }: { side: Side; confirmed: boolean }) {
  const buy = side === "buy"
  const label = confirmed ? (buy ? "خرید" : "فروش") : buy ? "نزدیک خرید" : "نزدیک فروش"
  const className = confirmed
    ? buy
      ? "bg-buy text-bg"
      : "bg-sell text-bg"
    : "border border-border bg-elevated text-fg"
  return <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${className}`}>{label}</span>
}

function CoinMark({ image, symbol }: { image: string; symbol: string }) {
  const [failed, setFailed] = useState(false)
  if (failed || !image) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-elevated text-xs font-semibold">
        {symbol.slice(0, 3)}
      </span>
    )
  }
  return (
    <img
      src={image}
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-lg"
      onError={() => setFailed(true)}
    />
  )
}

function Num({ children }: { children: string }) {
  return (
    <span dir="ltr" className="tabular-nums">
      {children}
    </span>
  )
}

function AllTable({
  rows,
  openPair,
  onToggle,
  pending,
}: {
  rows: Joined[]
  openPair: string | null
  onToggle: (pair: string | null) => void
  pending: boolean
}) {
  const ordered = [...rows].sort((a, b) => score(a) - score(b) || a.coin.rank - b.coin.rank)
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="text-xs text-subtle">
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-start font-medium">ارز</th>
            <th className="px-3 py-3 text-start font-medium">قیمت</th>
            <th className="px-3 py-3 text-start font-medium">۲۴س</th>
            <th className="px-3 py-3 text-start font-medium">وضعیت</th>
            <th className="px-3 py-3 text-start font-medium">هیجانی</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => {
            const analysis = row.scan?.analysis ?? null
            const open = openPair === row.coin.pair
            return (
              <tr key={row.coin.pair} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3" colSpan={open ? 5 : 1}>
                  {open ? (
                    <div className="flex flex-col gap-3">
                      <button type="button" onClick={() => onToggle(null)} className="flex items-center gap-2 text-start">
                        <CoinMark image={row.coin.image} symbol={row.coin.symbol} />
                        <span className="font-medium">{row.coin.symbol}</span>
                        <span className="text-xs text-muted">{row.coin.name}</span>
                      </button>
                      {analysis && row.scan?.candles.length ? (
                        <PriceChart
                          candles={row.scan.candles}
                          entry={analysis.entry ?? analysis.lastClose}
                          stop={analysis.stop}
                          takeProfit={analysis.takeProfit}
                          emotionalIndexes={analysis.emotionalIndexes}
                          swingLowIndex={analysis.swingLowIndex}
                          swingHighIndex={analysis.swingHighIndex}
                        />
                      ) : (
                        <p className="text-xs text-muted">کندلی برای این نماد در بازار تتر نیست.</p>
                      )}
                      <p className="text-xs text-muted">{describe(row)}</p>
                    </div>
                  ) : (
                    <button type="button" onClick={() => onToggle(row.coin.pair)} className="flex items-center gap-2 text-start">
                      <span className="w-6 text-xs tabular-nums text-subtle" dir="ltr">
                        {row.coin.rank || ""}
                      </span>
                      <span className="font-medium">{row.coin.symbol}</span>
                      <span className="truncate text-xs text-muted">{row.coin.name}</span>
                    </button>
                  )}
                </td>
                {open ? null : (
                  <>
                    <td className="px-3 py-3 tabular-nums" dir="ltr">
                      {analysis ? formatPrice(analysis.lastClose) : pending && !row.scan ? "…" : "—"}
                    </td>
                    <td
                      className={row.coin.change24h >= 0 ? "px-3 py-3 tabular-nums text-buy" : "px-3 py-3 tabular-nums text-sell"}
                      dir="ltr"
                    >
                      {formatPct(row.coin.change24h, true)}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{row.scan ? describe(row) : pending ? "در صف" : "—"}</td>
                    <td className="px-3 py-3 tabular-nums" dir="ltr">
                      {analysis ? analysis.emotionalCount : "—"}
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function score(row: Joined): number {
  const signal = row.scan?.analysis?.signal
  const near = row.scan?.analysis?.near
  if (signal === "buy") return 0
  if (signal === "sell") return 1
  if (near === "buy") return 2
  if (near === "sell") return 3
  if (!row.scan?.ok) return 6
  return 4
}

function describe(row: Joined): string {
  const analysis = row.scan?.analysis
  if (!row.scan) return "در صف"
  if (!row.scan.ok || !analysis) return "بازار تتر ندارد"
  if (analysis.signal === "buy") return "خرید"
  if (analysis.signal === "sell") return "فروش"
  if (analysis.ambiguous) return "خرید و فروش همزمان؛ سیگنال صادر نشد"
  if (analysis.emotionalCount > 0 && (analysis.buy.gate === "ok" || analysis.sell.gate === "ok")) {
    return `ساختار بود، ${analysis.emotionalCount} کندل هیجانی مانع شد`
  }
  if (analysis.near === "buy") return "نزدیک خرید"
  if (analysis.near === "sell") return "نزدیک فروش"
  if (analysis.emotionalCount > 0) return `${analysis.emotionalCount} کندل با سایه هیجانی`
  const buyRank = GATE_RANK[analysis.buy.gate]
  const sellRank = GATE_RANK[analysis.sell.gate]
  if (buyRank === sellRank && analysis.buy.gate === "no-swing") return gateLabel("no-swing")
  if (buyRank >= sellRank) return `خرید · ${gateLabel(analysis.buy.gate)}`
  return `فروش · ${gateLabel(analysis.sell.gate)}`
}
