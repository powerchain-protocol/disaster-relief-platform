import type { MetadataRoute } from "next";
const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://powerchain.org").replace(/\/$/,"");
export default function sitemap():MetadataRoute.Sitemap{
  return ["","/about","/programs","/network","/status","/docs","/solana","/legal"].map(path=>({
    url:`${base}${path}`,
    lastModified:new Date(),
    changeFrequency:path===""?"weekly":"monthly",
    priority:path===""?1:path==="/solana"?0.9:0.7
  }));
}
