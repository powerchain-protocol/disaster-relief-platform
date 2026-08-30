import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const root=resolve(new URL("..", import.meta.url).pathname);
for (const forbidden of ["backend","postman","powerchain-disaster-relief.yaml"]) assert.equal(existsSync(resolve(root,forbidden)),false,`forbidden root API artifact: ${forbidden}`);
for (const path of ["apps/backend/src/api/register.ts","apps/backend/src/api/v1/solana.ts","apps/backend/src/services/solana-data.ts","api/README.md","api/openapi/powerchain-disaster-relief.yaml","api/endpoints/routes.json","api/fallbacks/README.md","api/swagger/README.md","api/postman/PowerChain-Disaster-Relief.postman_collection.json","programs/registry.json"]) assert.equal(existsSync(resolve(root,path)),true,`missing canonical repository surface: ${path}`);
console.log("Repository layout PASS — one backend; API assets consolidated under api/");
