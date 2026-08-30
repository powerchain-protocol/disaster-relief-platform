export function StatusBadge({value}:{value:string|null|undefined}) {
  const normalized=(value||"UNKNOWN").toUpperCase();
  const tone=["LIVE","READY","DEPLOYED","SPL_TOKEN","TOKEN_2022"].includes(normalized)?"ok":["DEGRADED","UNCONFIGURED"].includes(normalized)?"warn":["UNAVAILABLE","NOT_READY","NOT_FOUND","INVALID_CONFIGURATION"].includes(normalized)?"bad":"neutral";
  return <span className={`status-badge status-${tone}`}>{normalized.replaceAll("_"," ")}</span>;
}
