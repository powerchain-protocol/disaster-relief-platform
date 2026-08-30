"use client";
import { AssetIcon, ChainIcon, WalletBrandIcon } from "./web3-icon";

const items=[
 {kind:"chain",key:"solana",label:"Solana",meta:"Settlement"},
 {kind:"token",key:"USDC",label:"USDC",meta:"Crisis capital"},
 {kind:"token",key:"SOL",label:"SOL",meta:"Network fees"},
 {kind:"token",key:"PWRC",label:"PWRC",meta:"Network utility"},
 {kind:"wallet",key:"phantom",label:"Phantom",meta:"Wallet"},
 {kind:"wallet",key:"solflare",label:"Solflare",meta:"Wallet"},
 {kind:"wallet",key:"backpack",label:"Backpack",meta:"Wallet"},
];
function Icon({kind,id}:{kind:string;id:string}){
 if(kind==="chain")return <ChainIcon network={id} size={28}/>;
 if(kind==="wallet")return <WalletBrandIcon name={id} size={28}/>;
 return <AssetIcon symbol={id} size={28}/>;
}
export function Web3Ecosystem(){
 return <section className="web3-ecosystem-section" aria-label="PowerChain Web3 ecosystem"><div className="shell web3-ecosystem-shell">
   <div className="web3-ecosystem-copy"><span className="eyebrow">NETWORK + ASSET ECOSYSTEM</span><strong>Web3 infrastructure inside the operating model—not as hero decoration.</strong></div>
   <div className="web3-ecosystem-list">{items.map(item=><div key={`${item.kind}-${item.key}`} className="web3-ecosystem-item"><Icon kind={item.kind} id={item.key}/><span><b>{item.label}</b><small>{item.meta}</small></span></div>)}</div>
 </div></section>
}
