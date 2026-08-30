"use client";
import { NetworkIcon, TokenIcon, WalletIcon } from "@web3icons/react/dynamic";

export function ChainIcon({network,size=24,className}:{network:string;size?:number;className?:string}){
  return <NetworkIcon network={network} size={size} variant="branded" className={className} fallback={<span className="web3-icon-fallback"/>}/>;
}
export function AssetIcon({symbol,size=24,className}:{symbol:string;size?:number;className?:string}){
  return <TokenIcon symbol={symbol} size={size} variant="branded" className={className} fallback={<span className="web3-icon-fallback"/>}/>;
}
export function WalletBrandIcon({name,size=24,className}:{name:string;size?:number;className?:string}){
  return <WalletIcon name={name} size={size} variant="branded" className={className} fallback={<span className="web3-icon-fallback"/>}/>;
}
