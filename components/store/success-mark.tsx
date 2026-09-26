"use client"

import { motion } from "motion/react"
import { Check } from "lucide-react"

export function SuccessMark() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="mx-auto grid size-20 place-items-center rounded-full bg-success text-background"
    >
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 14 }}>
        <Check className="size-10" strokeWidth={2.5} />
      </motion.span>
    </motion.div>
  )
}
