import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-Bs_P81uV.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getUniverse_createServerFn_handler = createServerRpc({
	id: "94039fcad27aec9eee06e3e638107c7d3fdb143ba43fdb03aa3024fa54f872a3",
	name: "getUniverse",
	filename: "src/lib/market/scan.ts"
}, (opts) => getUniverse.__executeServer(opts));
var getUniverse = createServerFn({ method: "GET" }).handler(getUniverse_createServerFn_handler, async () => {
	const { loadUniverse } = await import("./market-data-DO9agwVl.mjs");
	return { coins: await loadUniverse(false) };
});
var scanSymbols_createServerFn_handler = createServerRpc({
	id: "31ed0fdef35b0a884bae1cfa4842da895fab5b10af8cb24c98a6c940b3edb548",
	name: "scanSymbols",
	filename: "src/lib/market/scan.ts"
}, (opts) => scanSymbols.__executeServer(opts));
var scanSymbols = createServerFn({ method: "POST" }).validator((data) => data).handler(scanSymbols_createServerFn_handler, async ({ data }) => {
	const { isIntervalId, sanitizePairs, scanPairs } = await import("./market-data-DO9agwVl.mjs");
	if (!isIntervalId(data.interval)) throw new Error("تایم‌فریم نامعتبر است");
	const interval = data.interval;
	return { rows: await scanPairs(sanitizePairs(data.pairs), interval, Boolean(data.fresh)) };
});
//#endregion
export { getUniverse_createServerFn_handler, scanSymbols_createServerFn_handler };
