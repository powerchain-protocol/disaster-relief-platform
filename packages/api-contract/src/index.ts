export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet";
export type DataState = "LIVE" | "DEGRADED" | "UNAVAILABLE" | "UNCONFIGURED";
export type ProgramState = "DEPLOYED" | "NOT_FOUND" | "UNCONFIGURED" | "INVALID_CONFIGURATION";
export type MarketProvider = "PYTH" | "JUPITER_PRICE_V3" | "JUPITER_TOKENS_V2" | "COINGECKO" | "COINMARKETCAP" | "BIRDEYE" | "HELIUS_DAS";
export type TokenProgramKind = "SPL_TOKEN" | "TOKEN_2022" | "UNKNOWN";

export interface DataSourceMeta {
  provider: string;
  state: DataState;
  fetchedAt: string;
  publishedAt?: string;
  freshnessSeconds?: number;
  cached?: boolean;
  ttlSeconds?: number;
}

export interface SolanaOverview {
  network: SolanaCluster;
  status: DataState;
  source: DataSourceMeta & { latencyMs?: number };
  clusterVerification: {
    genesisHash: string | null;
    expectedGenesisHash: string | null;
    matchesExpected: boolean | null;
  };
  chain: {
    health: string | null;
    slot: number | null;
    blockHeight: number | null;
    epoch: number | null;
    slotIndex: number | null;
    slotsInEpoch: number | null;
    solanaCore: string | null;
    featureSet: number | null;
    blockhash: string | null;
    lastValidBlockHeight: number | null;
    totalSupplyLamports: string | null;
    circulatingSupplyLamports: string | null;
  };
  capabilities: {
    assets: "RPC_PLUS_METADATA" | "RPC_ONLY" | "UNAVAILABLE";
    market: "MULTI_PROVIDER" | "JUPITER_V3_PLUS_LIQUIDITY" | "JUPITER_V3" | "FALLBACK_ONLY" | "UNAVAILABLE";
  };
}

export interface SolanaProgramInfo {
  slug: string;
  label: string;
  family: string;
  required: boolean;
  programId: string | null;
  state: ProgramState;
  deploymentVerified: boolean;
  executable: boolean | null;
  owner: string | null;
  loader: "BPF_LOADER_UPGRADEABLE" | "LOADER_V4" | "BPF_LOADER" | "OTHER" | null;
  lamports: string | null;
  dataLength: number | null;
  programDataAddress: string | null;
  lastDeploySlot: number | null;
  upgradeAuthority: string | null;
  deploymentFingerprintSha256: string | null;
}

export interface MarketObservation {
  provider: MarketProvider;
  priceUsd: number;
  confidenceUsd?: number;
  change24hPct?: number;
  liquidityUsd?: number;
  volume24hUsd?: number;
  marketCapUsd?: number;
  priceBlockId?: number;
  decimals?: number;
  source: DataSourceMeta;
}

export interface SolanaMarketResponse {
  mint: string;
  network: SolanaCluster;
  status: DataState;
  onChain: {
    supplyAtomic: string;
    uiAmountString: string | null;
    decimals: number;
    source: DataSourceMeta;
  };
  market: {
    priceUsd: number;
    change24hPct: number | null;
    liquidityUsd: number | null;
    volume24hUsd: number | null;
    marketCapUsd: number | null;
    priceBlockId: number | null;
    currentSlot: number | null;
    blockLag: number | null;
    decimals: number | null;
    liquiditySource: MarketProvider | null;
  };
  priceUsd: number;
  primaryProvider: MarketProvider;
  observations: MarketObservation[];
  divergenceBps?: number;
  resolution: {
    strategy: "CONFIGURED_PRIORITY_WITH_DIVERGENCE_CHECK";
    providerPriority: MarketProvider[];
    availableProviders: MarketProvider[];
    selectedProvider: MarketProvider;
    maxDivergenceBps: number;
    pythConfidenceBps: number | null;
    maxPythConfidenceBps: number;
  };
  derived: {
    fullyDilutedValueUsd: number | null;
  };
  use: "DISPLAY_AND_ANALYTICS_ONLY";
  fetchedAt: string;
}

export interface SolanaMintExtensionInfo {
  name: string;
  source: "RPC_JSON_PARSED";
  details?: unknown;
}

export interface SolanaAssetResponse {
  mint: string;
  network: SolanaCluster;
  status: DataState;
  source: DataSourceMeta;
  tokenProgram: string | null;
  tokenProgramKind: TokenProgramKind;
  accountDataLength: number | null;
  decimals: number | null;
  supplyAtomic: string | null;
  uiAmountString: string | null;
  initialized: boolean | null;
  authorities: {
    mintAuthority: string | null;
    freezeAuthority: string | null;
  };
  extensions: SolanaMintExtensionInfo[];
  extensionParsing: "RPC_JSON_PARSED" | "UNAVAILABLE";
  name: string | null;
  symbol: string | null;
  interface: string | null;
  metadataUri: string | null;
  image: string | null;
  priceUsd?: number;
}


export interface WalletAssetItem {
  id: string;
  interface: string | null;
  name: string | null;
  symbol: string | null;
  image: string | null;
  tokenProgram: string | null;
  balanceAtomic: string | null;
  decimals: number | null;
  uiAmount: number | null;
  priceUsd: number | null;
  valueUsd: number | null;
}

export interface WalletPortfolioResponse {
  address: string;
  network: SolanaCluster;
  status: DataState;
  fetchedAt: string;
  native: {
    lamports: string | null;
    sol: number | null;
    source: DataSourceMeta;
  };
  assets: {
    provider: "HELIUS_DAS";
    state: DataState;
    lastIndexedSlot: number | null;
    total: number;
    items: WalletAssetItem[];
    source: DataSourceMeta;
  };
}
