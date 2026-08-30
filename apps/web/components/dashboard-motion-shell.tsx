"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function DashboardMotionShell({children}:{children:ReactNode}){
  const reduce=useReducedMotion();
  return <motion.div
    initial={reduce?false:{opacity:0}}
    animate={reduce?undefined:{opacity:1}}
    transition={{duration:0.28,ease:[0.2,0.7,0.2,1]}}>
    {children}
  </motion.div>
}

export function DashboardPanelMotion({children,className=""}:{children:ReactNode;className?:string}){
  const reduce=useReducedMotion();
  return <motion.div className={className}
    initial={reduce?false:{opacity:0,y:8}}
    whileInView={reduce?undefined:{opacity:1,y:0}}
    viewport={{once:true,amount:0.2}}
    transition={{duration:0.3,ease:[0.2,0.7,0.2,1]}}>
    {children}
  </motion.div>
}
