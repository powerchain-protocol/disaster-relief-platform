export type HealthSnapshot = {
  status: "ok";
  version: "1.0.0";
  uptimeSeconds: number;
  timestamp: string;
  process: {
    node: string;
    pid: number;
    memory: { rssBytes: number; heapUsedBytes: number; heapTotalBytes: number; externalBytes: number };
  };
};

export function buildHealthSnapshot(startedAt: number, version: "1.0.0" = "1.0.0"): HealthSnapshot {
  const memory = process.memoryUsage();
  return {
    status: "ok",
    version,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    process: {
      node: process.version,
      pid: process.pid,
      memory: {
        rssBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
        heapTotalBytes: memory.heapTotal,
        externalBytes: memory.external,
      },
    },
  };
}
