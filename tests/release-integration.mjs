import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url); let ts;
try{ts=require("typescript");}catch{const p="/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js";if(!existsSync(p))throw new Error("typescript required");ts=require(p);}

Object.assign(process.env,{
  NODE_ENV:"production",POWERCHAIN_ENV:"production",ALLOW_DEV_FALLBACK:"false",SOLANA_NETWORK:"mainnet-beta",
  SOLANA_RPC_URL:"https://rpc.release-fixture.invalid",SOLANA_RPC_FALLBACK_URLS:"https://rpc2.release-fixture.invalid",SOLANA_RPC_PROVIDER:"RELEASE_FIXTURE_RPC",RPC_CIRCUIT_FAILURE_THRESHOLD:"3",RPC_CIRCUIT_COOLDOWN_MS:"30000",RPC_MAX_FAILOVER_ATTEMPTS:"2",
  SOLANA_EXPECTED_GENESIS_HASH:"5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID:"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  SOLANA_LAUNCH_POLICY_PROGRAM_ID:"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  SOLANA_TOKEN_FACTORY_PROGRAM_ID:"BPFLoaderUpgradeab1e11111111111111111111111",
  JUPITER_API_KEY:"fixture-jupiter-credential",COINGECKO_API_KEY:"fixture-coingecko-credential",
  JUPITER_TOKENS_LIQUIDITY_ENABLED:"true",MARKET_PROVIDER_PRIORITY:"JUPITER_PRICE_V3,COINGECKO",
  PWRC_MINT:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",REQUIRED_PROVIDER_QUORUM:"2",PROVIDER_QUORUM_FAILURE_HYSTERESIS:"2",PROVIDER_QUORUM_RECOVERY_HYSTERESIS:"2",
});
delete process.env.HELIUS_API_KEY; delete process.env.HELIUS_RPC_URL; delete process.env.PYTH_API_KEY; delete process.env.COINMARKETCAP_API_KEY; delete process.env.BIRDEYE_API_KEY;
const mint=process.env.PWRC_MINT; const now=Math.floor(Date.now()/1000);
const loader="BPFLoaderUpgradeab1e11111111111111111111111";
const programDataAddressBytes=Buffer.alloc(32,7);
const programAccountData=Buffer.alloc(36);programAccountData.writeUInt32LE(2,0);programDataAddressBytes.copy(programAccountData,4);
const programCode=Buffer.from("powerchain-release-fixture-program-code-v1");
const programData=Buffer.alloc(13+programCode.length);programData.writeUInt32LE(3,0);programData.writeBigUInt64LE(777n,4);programData[12]=0;programCode.copy(programData,13);
const expectedFingerprint=createHash("sha256").update(programCode).digest("hex");
process.env.EXPECTED_PROGRAM_FINGERPRINTS_JSON=JSON.stringify({"launchpad-registry":expectedFingerprint,"launch-policy":expectedFingerprint,"token-factory":expectedFingerprint});
const account={owner:loader,executable:true,lamports:1_000_000,data:[programAccountData.toString("base64"),"base64"]};
const programDataAccount={owner:loader,executable:false,lamports:1_000_000,data:[programData.toString("base64"),"base64"]};
function json(data){return new Response(JSON.stringify(data),{status:200,headers:{"content-type":"application/json"}})}
globalThis.fetch=async(url,init={})=>{
  const u=String(url);
  if(u.includes("api.jup.ag/price/v3"))return json({[mint]:{usdPrice:1.001,blockId:999,decimals:6,priceChange24h:0.2}});
  if(u.includes("api.jup.ag/tokens/v2/search"))return json([{id:mint,liquidityUsd:5_000_000,decimals:6,usdPrice:1.001}]);
  if(u.includes("coingecko")&&u.includes("simple/token_price/solana"))return json({[mint]:{usd:1.0005,usd_market_cap:1_000_000,usd_24h_vol:100_000,usd_24h_change:0.15,last_updated_at:now}});
  const body=JSON.parse(String(init.body||"{}"));
  if(Array.isArray(body))return json(body.map(call=>{const values={getHealth:"ok",getSlot:1000,getBlockHeight:990,getEpochInfo:{epoch:800,slotIndex:100,slotsInEpoch:432000},getVersion:{"solana-core":"3.1.10","feature-set":123},getLatestBlockhash:{context:{slot:1000},value:{blockhash:"11111111111111111111111111111111",lastValidBlockHeight:1200}},getGenesisHash:process.env.SOLANA_EXPECTED_GENESIS_HASH,getSupply:{context:{slot:1000},value:{total:600000000000000000,circulating:500000000000000000}}};return{jsonrpc:"2.0",id:call.id,result:values[call.method]}}));
  if(body.method==="getMultipleAccounts"){const ids=body.params?.[0]||[];const original=new Set([process.env.SOLANA_LAUNCHPAD_REGISTRY_PROGRAM_ID,process.env.SOLANA_LAUNCH_POLICY_PROGRAM_ID,process.env.SOLANA_TOKEN_FACTORY_PROGRAM_ID]);return json({jsonrpc:"2.0",id:body.id,result:{context:{slot:1000},value:ids.map(id=>original.has(id)?account:programDataAccount)}});}
  if(body.method==="getTokenSupply")return json({jsonrpc:"2.0",id:body.id,result:{context:{slot:1000},value:{amount:"1000000000000",decimals:6,uiAmountString:"1000000"}}});
  if(body.method==="getSlot")return json({jsonrpc:"2.0",id:body.id,result:1000});
  throw new Error(`unexpected fixture request ${u} ${JSON.stringify(body)}`);
};
const source=readFileSync(new URL("../apps/backend/src/services/solana-data.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const temp=join(tmpdir(),`powerchain-release-${process.pid}.cjs`);writeFileSync(temp,compiled);
const service=await import(`file://${temp}?t=${Date.now()}`);
try{
  const overview=await service.getSolanaOverview();assert.equal(overview.network,"mainnet-beta");assert.equal(overview.clusterVerification.matchesExpected,true);assert.equal(overview.status,"LIVE");
  const programs=await service.getSolanaPrograms();assert.equal(programs.verification.requiredMissing,0);assert.equal(programs.programs.filter(p=>p.required).length,3);assert.ok(programs.programs.filter(p=>p.required).every(p=>p.deploymentVerified&&p.state==="DEPLOYED"&&p.deploymentFingerprintSha256===expectedFingerprint));
  const market=await service.getSolanaMarket(mint);assert.equal(market.status,"LIVE");assert.equal(market.onChain.decimals,6);assert.equal(market.primaryProvider,"JUPITER_PRICE_V3");
  const providers=service.getProviderStatus();for(const name of ["SOLANA_RPC","JUPITER_PRICE_V3","JUPITER_TOKENS_V2","COINGECKO"]){const p=providers.providers.find(x=>x.provider===name);assert.equal(p?.configured,true,name);assert.equal(p?.state,"LIVE",name);assert.ok(p?.lastCheckedAt,name);}
  assert.equal(providers.status,"LIVE");assert.equal(providers.summary.rawQuorumMet,true);assert.equal(providers.summary.quorumMet,true);assert.equal(providers.rpc.endpointCount,2);assert.ok(providers.providers.filter(p=>p.configured&&p.state==="LIVE").every(p=>p.fresh));
  console.log("Release integration fixture passed: intended cluster + required programs + credentialed provider telemetry");
}finally{try{unlinkSync(temp)}catch{}}
