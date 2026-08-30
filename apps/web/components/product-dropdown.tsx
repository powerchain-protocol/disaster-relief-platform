"use client";
import { useEffect,useRef,useState } from "react";

const groups=[
 {title:"Operate",items:[
  {href:"/solana",title:"Operations console",body:"Cluster, markets, providers and asset intelligence."},
  {href:"/status",title:"System status",body:"Readiness, RPC failover, quorum and SLOs."}]},
 {title:"Verify",items:[
  {href:"/programs",title:"Programs",body:"Executable state, loaders, ProgramData and fingerprints."},
  {href:"/network",title:"Network architecture",body:"Source-of-truth, settlement and provider boundaries."}]},
 {title:"Understand",items:[
  {href:"/about",title:"Platform overview",body:"Mission, governance and operating model."},
  {href:"/docs",title:"Documentation",body:"Whitepaper, OpenAPI and implementation references."}]},
];

export function ProductDropdown(){
 const[open,setOpen]=useState(false);const wrap=useRef<HTMLDivElement>(null);
 useEffect(()=>{const pointer=(event:PointerEvent)=>{if(open&&wrap.current&&!wrap.current.contains(event.target as Node))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};document.addEventListener("pointerdown",pointer);document.addEventListener("keydown",key);return()=>{document.removeEventListener("pointerdown",pointer);document.removeEventListener("keydown",key)}},[open]);
 return <div className="product-menu" ref={wrap}>
  <button className="nav-menu-trigger" type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-haspopup="menu">Product <span className="nav-chevron" aria-hidden="true"/></button>
  {open?<div className="product-mega-menu" role="menu">
   <div className="product-mega-main">
    <div className="product-mega-heading"><span className="menu-kicker">POWERCHAIN RELIEF</span><strong>Verified capital infrastructure</strong><p>Move from operational truth to authorized action without collapsing evidence, settlement or authority boundaries.</p></div>
    <div className="product-mega-groups">{groups.map(group=><div key={group.title} className="product-mega-group"><span>{group.title}</span>{group.items.map(item=><a role="menuitem" key={item.href} href={item.href} onClick={()=>setOpen(false)}><div><strong>{item.title}</strong><small>{item.body}</small></div><i>↗</i></a>)}</div>)}</div>
   </div>
   <a className="product-architecture-card" href="/network" onClick={()=>setOpen(false)}>
    <div className="architecture-mini-top"><span>OPERATING ARCHITECTURE</span><b>Source-aware</b></div>
    <div className="architecture-mini-flow"><span>Sense</span><i/><span>Verify</span><i/><span>Fund</span><i/><span>Protect</span><i/><span>Prove</span></div>
    <div className="architecture-mini-layers"><span>Operational truth</span><span>Policy</span><span>Settlement</span><span>Evidence</span></div>
    <strong>Explore architecture <b>→</b></strong>
   </a>
  </div>:null}
 </div>
}
