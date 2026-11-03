import { i as __toESM } from "../_runtime.mjs";
import { n as gateLabel } from "./strategy-Ck1EHlp4.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Check, n as Search, r as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as Customized, i as ReferenceLine, n as YAxis, o as ResponsiveContainer, r as XAxis, t as ComposedChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D8mLBtBN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CandleLayer({ xAxisMap, yAxisMap, data }) {
	const xKey = xAxisMap ? Object.keys(xAxisMap)[0] : void 0;
	const yKey = yAxisMap ? Object.keys(yAxisMap)[0] : void 0;
	if (!xKey || !yKey || !xAxisMap || !yAxisMap || !data) return null;
	const xScale = xAxisMap[xKey].scale;
	const yScale = yAxisMap[yKey].scale;
	const band = data.length > 1 ? Math.abs(xScale(1) - xScale(0)) : 8;
	const bodyWidth = Math.max(2, Math.min(7, band * .62));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: data.map((point) => {
		const x = xScale(point.i);
		const yHigh = yScale(point.high);
		const yLow = yScale(point.low);
		const yOpen = yScale(point.open);
		const yClose = yScale(point.close);
		const color = point.close >= point.open ? "var(--color-buy)" : "var(--color-sell)";
		const top = Math.min(yOpen, yClose);
		const height = Math.max(1, Math.abs(yClose - yOpen));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: x,
				x2: x,
				y1: yHigh,
				y2: yLow,
				stroke: point.emotional ? "var(--color-fg)" : color,
				strokeWidth: point.emotional ? 1.5 : 1
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: x - bodyWidth / 2,
				y: top,
				width: bodyWidth,
				height,
				fill: point.emotional ? "transparent" : color,
				stroke: point.emotional ? "var(--color-fg)" : "none"
			}),
			point.swing === "low" || point.swing === "both" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x,
				cy: yLow,
				r: 2.5,
				fill: "var(--color-fg)"
			}) : null,
			point.swing === "high" || point.swing === "both" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: x,
				cy: yHigh,
				r: 2.5,
				fill: "var(--color-fg)"
			}) : null
		] }, point.i);
	}) });
}
function PriceChart({ candles, entry, stop, takeProfit, emotionalIndexes, swingLowIndex, swingHighIndex }) {
	if (candles.length < 2) return null;
	const emotional = new Set(emotionalIndexes ?? []);
	const data = candles.map((candle, index) => {
		const lowMark = swingLowIndex === index;
		const highMark = swingHighIndex === index;
		const swing = lowMark && highMark ? "both" : lowMark ? "low" : highMark ? "high" : null;
		return {
			i: index,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			emotional: emotional.has(index),
			swing
		};
	});
	const levels = [
		stop,
		takeProfit,
		entry
	].filter((value) => typeof value === "number");
	const min = Math.min(...data.map((point) => point.low), ...levels);
	const max = Math.max(...data.map((point) => point.high), ...levels);
	const pad = (max - min) * .08 || Math.abs(max) * .01 || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-36 w-full min-w-0",
		dir: "ltr",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
				data,
				margin: {
					top: 8,
					right: 4,
					left: 4,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "i",
						hide: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: [min - pad, max + pad],
						hide: true
					}),
					typeof stop === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: stop,
						stroke: "var(--color-sell)",
						strokeDasharray: "4 3",
						strokeWidth: 1
					}) : null,
					typeof takeProfit === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: takeProfit,
						stroke: "var(--color-buy)",
						strokeDasharray: "4 3",
						strokeWidth: 1
					}) : null,
					typeof entry === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: entry,
						stroke: "var(--color-muted)",
						strokeWidth: 1
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Customized, { component: CandleLayer })
				]
			})
		})
	});
}
function formatPrice(value) {
	if (!Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	let digits = 2;
	if (abs < 100) digits = 3;
	if (abs < 10) digits = 4;
	if (abs < 1) digits = 5;
	if (abs < .1) digits = 6;
	if (abs < .01) digits = 7;
	if (abs < .001) digits = 8;
	if (abs < 1e-4) digits = 10;
	return value.toLocaleString("en-US", {
		minimumFractionDigits: Math.min(2, digits),
		maximumFractionDigits: digits
	});
}
function formatPct(value, signed = false) {
	if (!Number.isFinite(value)) return "—";
	const text = Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	if (!signed) return `${value < 0 ? "−" : ""}${text}%`;
	if (value > 0) return `+${text}%`;
	if (value < 0) return `−${text}%`;
	return `${text}%`;
}
function formatWhen(time) {
	if (!time) return "—";
	return new Intl.DateTimeFormat("fa-IR", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Tehran"
	}).format(new Date(time));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getUniverse = createServerFn({ method: "GET" }).handler(createSsrRpc("94039fcad27aec9eee06e3e638107c7d3fdb143ba43fdb03aa3024fa54f872a3"));
var scanSymbols = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("31ed0fdef35b0a884bae1cfa4842da895fab5b10af8cb24c98a6c940b3edb548"));
var INTERVALS = [
	{
		id: "1h",
		label: "۱ ساعته"
	},
	{
		id: "4h",
		label: "۴ ساعته"
	},
	{
		id: "1d",
		label: "روزانه"
	}
];
var GATE_RANK = {
	ok: 6,
	"no-turn": 5,
	"no-pullback": 4,
	"no-departure": 3,
	broken: 2,
	"no-swing": 1
};
function Scanner() {
	const [interval, setInterval] = (0, import_react.useState)("4h");
	const [view, setView] = (0, import_react.useState)("setups");
	const [query, setQuery] = (0, import_react.useState)("");
	const [coins, setCoins] = (0, import_react.useState)([]);
	const [rows, setRows] = (0, import_react.useState)({});
	const [phase, setPhase] = (0, import_react.useState)("list");
	const [done, setDone] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)(null);
	const [nonce, setNonce] = (0, import_react.useState)(0);
	const [openPair, setOpenPair] = (0, import_react.useState)(null);
	const freshRef = (0, import_react.useRef)(false);
	const runRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const runId = ++runRef.current;
		const fresh = freshRef.current;
		freshRef.current = false;
		const controller = { cancelled: false };
		async function run() {
			setPhase("list");
			setError(null);
			setRows({});
			setDone(0);
			setOpenPair(null);
			try {
				const universe = await getUniverse();
				if (controller.cancelled || runId !== runRef.current) return;
				setCoins(universe.coins);
				setPhase("scan");
				const batches = [];
				for (let index = 0; index < universe.coins.length; index += 8) batches.push(universe.coins.slice(index, index + 8));
				let cursor = 0;
				let finished = 0;
				async function worker() {
					for (;;) {
						const index = cursor++;
						if (index >= batches.length) return;
						const batch = batches[index];
						const result = await scanSymbols({ data: {
							interval,
							pairs: batch.map((coin) => coin.pair),
							fresh
						} });
						if (controller.cancelled || runId !== runRef.current) return;
						finished += batch.length;
						setDone(finished);
						setRows((current) => {
							const next = { ...current };
							for (const row of result.rows) next[row.pair] = row;
							return next;
						});
					}
				}
				await Promise.all([
					worker(),
					worker(),
					worker()
				]);
				if (!controller.cancelled && runId === runRef.current) setPhase("done");
			} catch (cause) {
				if (controller.cancelled || runId !== runRef.current) return;
				setPhase("error");
				setError(cause instanceof Error && cause.message ? cause.message : "اسکن بازار انجام نشد");
			}
		}
		run();
		return () => {
			controller.cancelled = true;
		};
	}, [interval, nonce]);
	const joined = (0, import_react.useMemo)(() => coins.map((coin) => ({
		coin,
		scan: rows[coin.pair]
	})), [coins, rows]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return joined;
		return joined.filter(({ coin }) => {
			return coin.symbol.toLowerCase().includes(needle) || coin.name.toLowerCase().includes(needle) || coin.pair.toLowerCase().includes(needle);
		});
	}, [joined, query]);
	const signals = filtered.filter((row) => row.scan?.analysis?.signal);
	const nears = filtered.filter((row) => row.scan?.analysis?.near && !row.scan.analysis.signal);
	const buyCount = filtered.filter((row) => row.scan?.analysis?.signal === "buy").length;
	const sellCount = filtered.filter((row) => row.scan?.analysis?.signal === "sell").length;
	const busy = phase === "list" || phase === "scan";
	const progress = coins.length ? Math.min(100, Math.round(done / coins.length * 100)) : 0;
	function refresh() {
		if (busy) return;
		freshRef.current = true;
		setNonce((value) => value + 1);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted",
								children: "اسپات · ۱۰۰ ارز برتر"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-semibold tracking-tight",
								children: "رادار سوینگ"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: refresh,
							disabled: busy,
							className: "inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-fg px-4 text-sm font-medium text-bg disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: busy ? "size-4 animate-spin motion-reduce:animate-none" : "size-4" }), "بروزرسانی"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-3xl text-sm text-muted",
						children: "اگر ۶۰ کندل آخر سایه هیجانی بلند نداشته باشد، قیمت به پایین‌ترین سوینگ لو پولبک بزند و برگردد بالا، خرید است. آینه آن روی بالاترین سوینگ های، فروش است. حد ضرر روی همان سوینگ می‌نشیند و هدف دو برابر ریسک است."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-11 grid-cols-3 rounded-lg border border-border bg-surface p-1 sm:w-80",
							children: INTERVALS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": interval === item.id,
								onClick: () => setInterval(item.id),
								className: interval === item.id ? "rounded-md bg-fg text-sm font-medium text-bg" : "rounded-md text-sm text-muted",
								children: item.label
							}, item.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "relative block min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "جستجوی ارز"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "جستجوی نماد یا نام",
									className: "h-11 w-full rounded-lg border border-border bg-surface ps-10 pe-3 text-sm text-fg placeholder:text-subtle"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "خرید",
								value: String(buyCount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "فروش",
								value: String(sellCount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "نزدیک ستاپ",
								value: String(nears.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "پیشرفت",
								value: coins.length ? `${done}/${coins.length}` : "—"
							})
						]
					}),
					busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1 overflow-hidden rounded-full bg-elevated",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "progress-fill h-full bg-fg",
							style: { width: `${progress}%` }
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid h-11 grid-cols-2 rounded-lg border border-border bg-surface p-1 sm:w-72",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === "setups",
							onClick: () => setView("setups"),
							className: view === "setups" ? "rounded-md bg-elevated text-sm font-medium text-fg" : "rounded-md text-sm text-muted",
							children: "سیگنال‌ها"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": view === "all",
							onClick: () => setView("all"),
							className: view === "all" ? "rounded-md bg-elevated text-sm font-medium text-fg" : "rounded-md text-sm text-muted",
							children: "همه ارزها"
						})]
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-border bg-surface p-4 text-sm text-sell",
				role: "alert",
				children: error
			}) : null,
			phase === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, {}) : null,
			view === "setups" && phase !== "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalGroup, {
					title: "موقعیت‌های باز",
					rows: signals,
					empty: phase === "done" ? "در این تایم‌فریم ستاپ کامل پیدا نشد." : "در حال خواندن کندل‌ها…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalGroup, {
					title: "نزدیک به ستاپ",
					rows: nears,
					empty: phase === "done" ? "مورد نزدیکی با ساختار پاک نیست." : "نزدیک‌ها بعد از اتمام هر دسته می‌آیند."
				})]
			}) : null,
			view === "all" && phase !== "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllTable, {
				rows: filtered,
				openPair,
				onToggle: setOpenPair,
				pending: phase === "scan"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-3xl border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "text-sm font-medium",
					children: "منطق دقیق سیگنال"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex max-w-3xl flex-col gap-3 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "پنجره بررسی، ۶۰ کندل آخر تایم‌فریم انتخاب‌شده است. سوینگ با دو کندل در هر طرف تأیید می‌شود." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "کندل هیجانی با سایه بلند: سایه غالب حداقل دو برابر بدنه و نصف طول کندل باشد، و خود سایه از میانگین دامنه همین ۶۰ کندل بلندتر باشد. اگر حتی یکی از این کندل‌ها در پنجره باشد، سیگنال صادر نمی‌شود." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "خرید: قیمت بعد از پایین‌ترین سوینگ لو از آن فاصله گرفته باشد، در کندل‌های اخیر به همان کف برگشته باشد، بسته آخر بالای سطح و صعودی باشد. فروش آینه همین شرایط روی بالاترین سوینگ های است." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "حد ضرر خرید روی پایین‌ترین سوینگ لو است و حد ضرر فروش روی بالاترین سوینگ های؛ یعنی پشت ورود و خلاف جهت معامله. هدف طوری گذاشته می‌شود که سود همیشه دو برابر فاصله ورود تا حد ضرر باشد." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "داده قیمت از بازار اسپات تتر است. این صفحه ابزار بررسی ستاپ است، نه توصیه خرید یا فروش." })
					]
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold tabular-nums",
			dir: "ltr",
			children: value
		})]
	});
}
function SkeletonList() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-2",
		"aria-hidden": "true",
		children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 rounded-3xl border border-border bg-surface motion-safe:animate-pulse" }, index))
	});
}
function SignalGroup({ title, rows, empty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-medium text-muted",
			children: title
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-3xl border border-border bg-surface px-4 py-6 text-sm text-muted",
			children: empty
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupCard, { row }, row.coin.pair))
		})]
	});
}
function SetupCard({ row }) {
	const analysis = row.scan?.analysis;
	if (!analysis) return null;
	const side = analysis.signal ?? analysis.near;
	if (!side) return null;
	const confirmed = Boolean(analysis.signal);
	const level = side === "buy" ? analysis.swingLow : analysis.swingHigh;
	const riskPct = analysis.entry != null && analysis.stop != null ? Math.abs(analysis.entry - analysis.stop) / analysis.entry * 100 : null;
	const rewardPct = analysis.entry != null && analysis.takeProfit != null ? Math.abs(analysis.takeProfit - analysis.entry) / analysis.entry * 100 : null;
	const last = row.scan?.candles[row.scan.candles.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rise-in flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {
						image: row.coin.image,
						symbol: row.coin.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold",
								children: row.coin.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-xs text-muted",
								children: row.coin.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-subtle",
							children: ["رتبه ", row.coin.rank || "—"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideBadge, {
					side,
					confirmed
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "قیمت"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold tabular-nums",
					dir: "ltr",
					children: formatPrice(analysis.lastClose)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: row.coin.change24h >= 0 ? "text-sm tabular-nums text-buy" : "text-sm tabular-nums text-sell",
					dir: "ltr",
					children: [formatPct(row.coin.change24h, true), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ms-1 text-xs text-subtle",
						children: "۲۴س"
					})]
				})]
			}),
			confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Level, {
						label: "ورود",
						value: formatPrice(analysis.entry ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Level, {
						label: "حد ضرر",
						value: formatPrice(analysis.stop ?? 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Level, {
						label: "هدف",
						value: formatPrice(analysis.takeProfit ?? 0)
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Level, {
					label: side === "buy" ? "سوینگ لو" : "سوینگ های",
					value: level == null ? "—" : formatPrice(level)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Level, {
					label: "فاصله",
					value: level == null ? "—" : formatPct((side === "buy" ? analysis.lastClose - level : level - analysis.lastClose) / analysis.lastClose * 100)
				})]
			}),
			confirmed && riskPct != null && rewardPct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"ریسک ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, { children: formatPct(riskPct) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1 text-subtle",
						children: "·"
					}),
					"سود ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, { children: formatPct(rewardPct) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-1 text-subtle",
						children: "·"
					}),
					"نسبت ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, { children: "1:2" })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: side === "buy" ? gateLabel(analysis.buy.gate) : gateLabel(analysis.sell.gate)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
				candles: row.scan?.candles ?? [],
				entry: confirmed ? analysis.entry : analysis.lastClose,
				stop: confirmed ? analysis.stop : level,
				takeProfit: confirmed ? analysis.takeProfit : null,
				emotionalIndexes: analysis.emotionalIndexes,
				swingLowIndex: analysis.swingLowIndex,
				swingHighIndex: analysis.swingHighIndex
			}),
			confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-1 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-fg" }), "۶۰ کندل بدون سایه هیجانی بلند"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-fg" }), side === "buy" ? "پولبک به پایین‌ترین سوینگ لو" : "پولبک به بالاترین سوینگ های"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-fg" }), side === "buy" ? "برگشت قیمت به سمت بالا" : "برگشت قیمت به سمت پایین"]
					})
				]
			}) : null,
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: ["آخرین کندل ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, { children: formatWhen(last.time) })]
			}) : null,
			confirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartKey, {}) : null
		]
	});
}
function ChartKey() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap gap-3 text-xs text-subtle",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block h-px w-4 bg-muted" }), "ورود"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block h-px w-4 bg-sell" }), "حد ضرر"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block h-px w-4 bg-buy" }), "هدف"]
			})
		]
	});
}
function Level({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-sm font-medium tabular-nums",
			dir: "ltr",
			children: value
		})]
	});
}
function SideBadge({ side, confirmed }) {
	const buy = side === "buy";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-lg px-2 py-1 text-xs font-semibold ${confirmed ? buy ? "bg-buy text-bg" : "bg-sell text-bg" : "border border-border bg-elevated text-fg"}`,
		children: confirmed ? buy ? "خرید" : "فروش" : buy ? "نزدیک خرید" : "نزدیک فروش"
	});
}
function CoinMark({ image, symbol }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	if (failed || !image) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-10 shrink-0 place-items-center rounded-lg bg-elevated text-xs font-semibold",
		children: symbol.slice(0, 3)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: image,
		alt: "",
		width: 40,
		height: 40,
		className: "size-10 shrink-0 rounded-lg",
		onError: () => setFailed(true)
	});
}
function Num({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		dir: "ltr",
		className: "tabular-nums",
		children
	});
}
function AllTable({ rows, openPair, onToggle, pending }) {
	const ordered = [...rows].sort((a, b) => score(a) - score(b) || a.coin.rank - b.coin.rank);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-3xl border border-border bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-xs text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "ارز"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "قیمت"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "۲۴س"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "وضعیت"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-3 text-start font-medium",
							children: "هیجانی"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ordered.map((row) => {
				const analysis = row.scan?.analysis ?? null;
				const open = openPair === row.coin.pair;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border last:border-b-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3",
						colSpan: open ? 5 : 1,
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onToggle(null),
									className: "flex items-center gap-2 text-start",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {
											image: row.coin.image,
											symbol: row.coin.symbol
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: row.coin.symbol
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: row.coin.name
										})
									]
								}),
								analysis && row.scan?.candles.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, {
									candles: row.scan.candles,
									entry: analysis.entry ?? analysis.lastClose,
									stop: analysis.stop,
									takeProfit: analysis.takeProfit,
									emotionalIndexes: analysis.emotionalIndexes,
									swingLowIndex: analysis.swingLowIndex,
									swingHighIndex: analysis.swingHighIndex
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "کندلی برای این نماد در بازار تتر نیست."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: describe(row)
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onToggle(row.coin.pair),
							className: "flex items-center gap-2 text-start",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 text-xs tabular-nums text-subtle",
									dir: "ltr",
									children: row.coin.rank || ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: row.coin.symbol
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-xs text-muted",
									children: row.coin.name
								})
							]
						})
					}), open ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 tabular-nums",
							dir: "ltr",
							children: analysis ? formatPrice(analysis.lastClose) : pending && !row.scan ? "…" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: row.coin.change24h >= 0 ? "px-3 py-3 tabular-nums text-buy" : "px-3 py-3 tabular-nums text-sell",
							dir: "ltr",
							children: formatPct(row.coin.change24h, true)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 text-xs text-muted",
							children: row.scan ? describe(row) : pending ? "در صف" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-3 tabular-nums",
							dir: "ltr",
							children: analysis ? analysis.emotionalCount : "—"
						})
					] })]
				}, row.coin.pair);
			}) })]
		})
	});
}
function score(row) {
	const signal = row.scan?.analysis?.signal;
	const near = row.scan?.analysis?.near;
	if (signal === "buy") return 0;
	if (signal === "sell") return 1;
	if (near === "buy") return 2;
	if (near === "sell") return 3;
	if (!row.scan?.ok) return 6;
	return 4;
}
function describe(row) {
	const analysis = row.scan?.analysis;
	if (!row.scan) return "در صف";
	if (!row.scan.ok || !analysis) return "بازار تتر ندارد";
	if (analysis.signal === "buy") return "خرید";
	if (analysis.signal === "sell") return "فروش";
	if (analysis.ambiguous) return "خرید و فروش همزمان؛ سیگنال صادر نشد";
	if (analysis.emotionalCount > 0 && (analysis.buy.gate === "ok" || analysis.sell.gate === "ok")) return `ساختار بود، ${analysis.emotionalCount} کندل هیجانی مانع شد`;
	if (analysis.near === "buy") return "نزدیک خرید";
	if (analysis.near === "sell") return "نزدیک فروش";
	if (analysis.emotionalCount > 0) return `${analysis.emotionalCount} کندل با سایه هیجانی`;
	const buyRank = GATE_RANK[analysis.buy.gate];
	const sellRank = GATE_RANK[analysis.sell.gate];
	if (buyRank === sellRank && analysis.buy.gate === "no-swing") return gateLabel("no-swing");
	if (buyRank >= sellRank) return `خرید · ${gateLabel(analysis.buy.gate)}`;
	return `فروش · ${gateLabel(analysis.sell.gate)}`;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scanner, {});
}
//#endregion
export { Home as component };
