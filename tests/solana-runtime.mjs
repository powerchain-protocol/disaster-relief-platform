import assert from "node:assert/strict";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
const require = createRequire(import.meta.url);
let ts;
try { ts = require("typescript"); } catch {
  const candidates = ["/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js","/usr/local/lib/node_modules/typescript/lib/typescript.js"];
  const candidate = candidates.find(existsSync);
  if (!candidate) throw new Error("typescript is required for the runtime smoke test");
  ts = require(candidate);
}

process.env.NODE_ENV = "development";
process.env.POWERCHAIN_ENV = "development";
process.env.ALLOW_DEV_FALLBACK = "false";
process.env.SOLANA_NETWORK = "devnet";
process.env.JUPITER_ALLOW_KEYLESS = "true";
process.env.JUPITER_TOKENS_LIQUIDITY_ENABLED = "true";
process.env.PROVIDER_TELEMETRY_MAX_AGE_SECONDS = "15";
process.env.REQUIRED_PROVIDER_QUORUM = "1";
process.env.PROVIDER_QUORUM_FAILURE_HYSTERESIS = "2";
process.env.PROVIDER_QUORUM_RECOVERY_HYSTERESIS = "2";
process.env.RPC_CIRCUIT_FAILURE_THRESHOLD = "1";
process.env.RPC_CIRCUIT_COOLDOWN_MS = "30000";
process.env.RPC_MAX_FAILOVER_ATTEMPTS = "2";
process.env.SOLANA_RPC_URL = "https://rpc-primary.invalid";
process.env.SOLANA_RPC_FALLBACK_URLS = "https://rpc-fallback.invalid";

delete process.env.HELIUS_RPC_URL;
delete process.env.HELIUS_API_KEY;
delete process.env.PYTH_API_KEY;
delete process.env.COINGECKO_API_KEY;
delete process.env.COINMARKETCAP_API_KEY;
delete process.env.BIRDEYE_API_KEY;

const mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const rawMint = Buffer.alloc(120); rawMint.writeBigUInt64LE(1_000_000n,36); rawMint[44]=6; rawMint[45]=1;

function json(data){ return new Response(JSON.stringify(data), { status: 200, headers: { "content-type":"application/json" } }); }
globalThis.fetch = async (url, init={}) => {
  const u = String(url);
  if (u.includes("api.jup.ag/price/v3")) return json({ [mint]: { usdPrice: 1.001, blockId: 499, decimals: 6, priceChange24h: 0.25 } });
  if (u.includes("rpc-primary.invalid")) throw new Error("primary RPC unavailable");
  if (u.includes("api.jup.ag/tokens/v2/search")) return json([{ id: mint, liquidityUsd: 2_500_000, decimals: 6 }]);
  const body = JSON.parse(String(init.body || "{}"));
  if (Array.isArray(body)) {
    const result = body.map(call => {
      const values = {
        getHealth: "ok", getSlot: 500, getBlockHeight: 490,
        getEpochInfo: { epoch: 42, slotIndex: 10, slotsInEpoch: 432000 },
        getVersion: { "solana-core":"3.1.10", "feature-set":123 },
        getLatestBlockhash: { context:{slot:500}, value:{blockhash:"11111111111111111111111111111111",lastValidBlockHeight:640} },
        getGenesisHash: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
        getSupply: { context:{slot:500}, value:{total:600000000000000000,circulating:500000000000000000} },
      };
      return { jsonrpc:"2.0", id:call.id, result: values[call.method] };
    });
    return json(result);
  }
  if (body.method === "getTokenSupply") return json({jsonrpc:"2.0",id:body.id,result:{context:{slot:500},value:{amount:"1000000",decimals:6,uiAmountString:"1"}}});
  if (body.method === "getSlot") return json({jsonrpc:"2.0",id:body.id,result:500});
  if (body.method === "getAccountInfo") {
    const encoding = body.params?.[1]?.encoding;
    if (encoding === "jsonParsed") return json({jsonrpc:"2.0",id:body.id,result:{context:{slot:500},value:{owner:"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",data:{program:"spl-token-2022",parsed:{type:"mint",info:{decimals:6,isInitialized:true,mintAuthority:null,freezeAuthority:null,extensions:[{extension:"transferFeeConfig",state:{withheldAmount:"0"}}]}}}}}});
    return json({jsonrpc:"2.0",id:body.id,result:{context:{slot:500},value:{owner:"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",executable:false,lamports:123,data:[rawMint.toString("base64"),"base64"]}}});
  }
  throw new Error(`unexpected fetch ${u} ${JSON.stringify(body)}`);
};

const source = readFileSync(new URL("../apps/backend/src/services/solana-data.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const temp = join(tmpdir(), `powerchain-solana-runtime-${process.pid}.cjs`); writeFileSync(temp,compiled);
const service = await import(`file://${temp}?t=${Date.now()}`);
try {
  const overview = await service.getSolanaOverview();
  assert.equal(overview.status,"LIVE"); assert.equal(overview.chain.slot,500); assert.equal(overview.chain.blockHeight,490); assert.equal(overview.chain.blockhash,"11111111111111111111111111111111"); assert.equal(overview.chain.solanaCore,"3.1.10");
  const market = await service.getSolanaMarket(mint);
  assert.equal(market.onChain.decimals,6); assert.equal(market.onChain.supplyAtomic,"1000000"); assert.equal(market.primaryProvider,"JUPITER_PRICE_V3"); assert.equal(market.market.liquidityUsd,2_500_000); assert.equal(market.market.blockLag,1);
  const asset = await service.getSolanaAsset(mint);
  assert.equal(asset.tokenProgramKind,"TOKEN_2022"); assert.equal(asset.decimals,6); assert.equal(asset.initialized,true); assert.equal(asset.extensions[0].name,"transferFeeConfig");
  const providers = service.getProviderStatus();
  assert.equal(providers.providers.find(item=>item.provider==="SOLANA_RPC")?.state,"LIVE");
  assert.equal(providers.providers.find(item=>item.provider==="JUPITER_PRICE_V3")?.state,"LIVE");
  assert.equal(providers.providers.find(item=>item.provider==="JUPITER_TOKENS_V2")?.state,"LIVE");
  assert.equal(providers.providers.find(item=>item.provider==="JUPITER_PRICE_V3")?.fresh,true);
  assert.equal(providers.rpc.endpointCount,2);
  assert.match(providers.rpc.activeEndpointId,/^rpc-2-/);
  assert.equal(providers.rpc.endpoints.find(item=>item.endpointId.startsWith("rpc-1-"))?.state,"OPEN");
  assert.equal(providers.summary.rawQuorumMet,true);
  assert.equal(providers.summary.quorumMet,true);
  const realNow=Date.now;const baseline=realNow();Date.now=()=>baseline+20_000;
  const staleProviders1=service.getProviderStatus();
  assert.equal(staleProviders1.providers.find(item=>item.provider==="JUPITER_PRICE_V3")?.state,"DEGRADED");
  assert.equal(staleProviders1.providers.find(item=>item.provider==="JUPITER_PRICE_V3")?.lastErrorCode,"TELEMETRY_STALE");
  assert.equal(staleProviders1.summary.rawQuorumMet,false);
  assert.equal(staleProviders1.summary.quorumMet,true);
  const staleProviders2=service.getProviderStatus();
  assert.equal(staleProviders2.summary.quorumMet,false);
  Date.now=realNow;
  const recovered1=service.getProviderStatus(); assert.equal(recovered1.summary.rawQuorumMet,true); assert.equal(recovered1.summary.quorumMet,false);
  const recovered2=service.getProviderStatus(); assert.equal(recovered2.summary.quorumMet,true);
  console.log("Solana runtime smoke passed: RPC failover/circuit + overview + market + Token-2022 + telemetry hysteresis");
} finally { try { unlinkSync(temp); } catch {} }
