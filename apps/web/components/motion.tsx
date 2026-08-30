"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";

const ease=[0.2,0.7,0.2,1] as const;

export function MotionSection({children,className="",delay=0}:{children:ReactNode;className?:string;delay?:number}){
  const reduce=useReducedMotion();
  return <motion.section className={className}
    initial={reduce?false:{opacity:0,y:14}}
    whileInView={reduce?undefined:{opacity:1,y:0}}
    viewport={{once:true,amount:0.16}}
    transition={{duration:0.42,delay,ease}}>
    {children}
  </motion.section>
}

export function MotionCard({children,className=""}:PropsWithChildren<{className?:string}>){
  const reduce=useReducedMotion();
  return <motion.div className={className}
    whileHover={reduce?undefined:{y:-2}}
    transition={{duration:0.16,ease}}>
    {children}
  </motion.div>
}

export function MotionFade({children,className="",delay=0}:PropsWithChildren<{className?:string;delay?:number}>){
  const reduce=useReducedMotion();
  return <motion.div className={className}
    initial={reduce?false:{opacity:0,y:8}}
    animate={reduce?undefined:{opacity:1,y:0}}
    transition={{duration:0.32,delay,ease}}>
    {children}
  </motion.div>
}
