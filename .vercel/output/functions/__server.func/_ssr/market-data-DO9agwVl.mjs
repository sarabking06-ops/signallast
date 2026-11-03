import { t as analyze } from "./strategy-Ck1EHlp4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-data-DO9agwVl.js
var VISION = "https://data-api.binance.vision";
var UNIVERSE_TTL = 6e5;
var KLINE_TTL = 6e4;
var TARGET = 100;
var STABLE_SYMBOLS = /* @__PURE__ */ new Set([
	"usdt",
	"usdc",
	"dai",
	"usds",
	"usde",
	"usd1",
	"pyusd",
	"usdg",
	"rlusd",
	"usdy",
	"usyc",
	"usdf",
	"usdd",
	"bfusd",
	"usdgo",
	"ousd",
	"usd0",
	"gho",
	"ustb",
	"eursafo",
	"buidl",
	"usdp",
	"tusd",
	"fdusd"
]);
var PAIR_BY_ID = {
	"the-open-network": "TONUSDT",
	"hedera-hashgraph": "HBARUSDT",
	"avalanche-2": "AVAXUSDT",
	binancecoin: "BNBUSDT",
	ripple: "XRPUSDT",
	"shiba-inu": "SHIBUSDT",
	"render-token": "RENDERUSDT",
	"polygon-ecosystem-token": "POLUSDT",
	"crypto-com-chain": "CROUSDT",
	near: "NEARUSDT",
	bittensor: "TAOUSDT",
	ethena: "ENAUSDT",
	memecore: "MUSDT",
	"worldcoin-wld": "WLDUSDT",
	"internet-computer": "ICPUSDT",
	"injective-protocol": "INJUSDT",
	filecoin: "FILUSDT",
	blockstack: "STXUSDT",
	"pancakeswap-token": "CAKEUSDT",
	"ether-fi": "ETHFIUSDT",
	"jupiter-exchange-solana": "JUPUSDT",
	"xdce-crowd-sale": "XDCUSDT",
	"flare-networks": "FLRUSDT",
	"kucoin-shares": "KCSUSDT",
	"gatechain-token": "GTUSDT",
	"bitget-token": "BGBUSDT",
	"leo-token": "LEOUSDT",
	whitebit: "WBTUSDT",
	"pi-network": "PIUSDT",
	hyperliquid: "HYPEUSDT",
	"tether-gold": "XAUTUSDT",
	"pax-gold": "PAXGUSDT",
	"wrapped-bitcoin": "WBTCUSDT",
	"ethereum-classic": "ETCUSDT",
	"bitcoin-cash": "BCHUSDT",
	"just": "JSTUSDT",
	"htx-dao": "HTXUSDT",
	"world-liberty-financial": "WLFIUSDT",
	"pump-fun": "PUMPUSDT",
	"ondo-finance": "ONDOUSDT",
	"layerzero": "ZROUSDT",
	dash: "DASHUSDT",
	aptos: "APTUSDT",
	cosmos: "ATOMUSDT",
	algorand: "ALGOUSDT",
	kaspa: "KASUSDT",
	mantle: "MNTUSDT",
	polkadot: "DOTUSDT",
	"cronos": "CROUSDT"
};
var INTERVAL_PARAM = {
	"1h": "1h",
	"4h": "4h",
	"1d": "1d"
};
var universeCache = null;
var klineCache = /* @__PURE__ */ new Map();
async function loadUniverse(fresh = false) {
	if (!fresh && universeCache && Date.now() - universeCache.at < UNIVERSE_TTL) return universeCache.value;
	const coins = await fetchTopCoins();
	universeCache = {
		at: Date.now(),
		value: coins
	};
	return coins;
}
async function fetchTopCoins() {
	const picked = [];
	const seen = /* @__PURE__ */ new Set();
	for (const page of [
		1,
		2,
		3
	]) {
		if (picked.length >= TARGET) break;
		const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=${page}&sparkline=false`;
		const response = await fetch(url, {
			headers: {
				accept: "application/json",
				"user-agent": "SwingRadar/1.0"
			},
			signal: AbortSignal.timeout(15e3)
		});
		if (!response.ok) throw new Error("فهرست ارزها دریافت نشد");
		const rows = await response.json();
		if (!Array.isArray(rows)) throw new Error("فهرست ارزها دریافت نشد");
		for (const row of rows) {
			const coin = toCoin(row);
			if (!coin || seen.has(coin.pair)) continue;
			seen.add(coin.pair);
			picked.push(coin);
			if (picked.length >= TARGET) break;
		}
	}
	if (picked.length < 20) throw new Error("فهرست ارزها ناقص است");
	return picked;
}
function toCoin(row) {
	const id = row.id ?? "";
	const symbol = (row.symbol ?? "").toLowerCase();
	if (!id || !symbol) return null;
	if (STABLE_SYMBOLS.has(symbol)) return null;
	if (isCashLike(id, symbol, row.name ?? "")) return null;
	const pair = pairFor(id, symbol);
	if (!pair) return null;
	return {
		id,
		symbol: symbol.toUpperCase(),
		pair,
		name: row.name || symbol.toUpperCase(),
		rank: row.market_cap_rank ?? 0,
		image: row.image ?? "",
		change24h: typeof row.price_change_percentage_24h === "number" ? row.price_change_percentage_24h : 0
	};
}
function isCashLike(id, symbol, name) {
	if (symbol === "u" || symbol.length <= 1) return symbol !== "m";
	const blob = `${id} ${name}`.toLowerCase();
	if (/(stablecoin|tether|dollar|euro|treasury|government securities|liquidity fund|overnight)/.test(blob)) return true;
	return false;
}
function pairFor(id, symbol) {
	if (PAIR_BY_ID[id]) return PAIR_BY_ID[id];
	const upper = symbol.toUpperCase();
	if (!/^[A-Z0-9]{2,15}$/.test(upper)) return null;
	return `${upper}USDT`;
}
async function scanPairs(pairs, interval, fresh = false) {
	return Promise.all(pairs.map((pair) => scanOne(pair, interval, fresh)));
}
async function scanOne(pair, interval, fresh) {
	try {
		const candles = await loadKlines(pair, interval, fresh);
		if (candles.length < 60) return {
			pair,
			ok: false,
			analysis: null,
			candles: []
		};
		return {
			pair,
			ok: true,
			analysis: analyze(candles),
			candles: candles.slice(-60)
		};
	} catch {
		return {
			pair,
			ok: false,
			analysis: null,
			candles: []
		};
	}
}
async function loadKlines(pair, interval, fresh) {
	const key = `${pair}:${interval}`;
	const cached = klineCache.get(key);
	if (!fresh && cached && Date.now() - cached.at < KLINE_TTL) return cached.value;
	const url = `${VISION}/api/v3/klines?symbol=${pair}&interval=${INTERVAL_PARAM[interval]}&limit=70`;
	const response = await fetch(url, { signal: AbortSignal.timeout(12e3) });
	if (!response.ok) throw new Error("kline");
	const payload = await response.json();
	if (!Array.isArray(payload) || payload.length === 0) throw new Error("kline");
	const candles = payload.map(parseKline).filter((candle) => candle != null);
	if (candles.length < 60) throw new Error("short");
	klineCache.set(key, {
		at: Date.now(),
		value: candles
	});
	return candles;
}
function parseKline(row) {
	if (!Array.isArray(row) || row.length < 5) return null;
	const time = Number(row[0]);
	const open = Number(row[1]);
	const high = Number(row[2]);
	const low = Number(row[3]);
	const close = Number(row[4]);
	if (![
		time,
		open,
		high,
		low,
		close
	].every(Number.isFinite)) return null;
	return {
		time,
		open,
		high,
		low,
		close
	};
}
function isIntervalId(value) {
	return value === "1h" || value === "4h" || value === "1d";
}
function sanitizePairs(pairs) {
	if (!Array.isArray(pairs) || pairs.length === 0 || pairs.length > 12) throw new Error("دسته نامعتبر است");
	return pairs.map((pair) => {
		if (typeof pair !== "string" || !/^[A-Z0-9]{2,20}USDT$/.test(pair)) throw new Error("نماد نامعتبر است");
		return pair;
	});
}
//#endregion
export { isIntervalId, loadUniverse, sanitizePairs, scanPairs };
