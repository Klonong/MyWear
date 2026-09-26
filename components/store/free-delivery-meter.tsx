"use client"

import { motion } from "motion/react"
import { Truck } from "lucide-react"
import { formatIDR, FREE_DELIVERY } from "@/lib/data"

export function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const remaining = FREE_DELIVERY - subtotal
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm" aria-live="polite">
        <Truck className="size-4 shrink-0" strokeWidth={1.5} />
        {remaining > 0 ? (
          <span>
            Add <b className="tabular font-semibold">{formatIDR(remaining)}</b> more for free delivery
          </span>
        ) : (
          <span className="font-medium text-success">You&apos;ve unlocked free delivery</span>
        )}
      </p>
      <div className="h-[3px] bg-line">
        <motion.div
          className="h-full origin-left bg-foreground"
          initial={false}
          animate={{ scaleX: Math.min(1, subtotal / FREE_DELIVERY) }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
