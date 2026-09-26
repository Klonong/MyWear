"use client"

import { AnimatePresence, motion } from "motion/react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "md",
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  size?: "sm" | "md"
}) {
  const btn = cn(
    "grid place-items-center transition-colors hover:bg-mist disabled:text-disabled disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-10",
  )
  return (
    <div className="inline-flex items-center border">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
        <Minus className="size-4" />
      </button>
      <span className="tabular relative w-8 overflow-hidden text-center text-sm" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="block"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus className="size-4" />
      </button>
    </div>
  )
}
