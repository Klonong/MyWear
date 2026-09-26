"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Tag, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FormField } from "@/components/store/form-field"
import { useStore } from "@/lib/store"
import { formatIDR } from "@/lib/data"
import { deliveryFee } from "@/lib/pricing"

export function OrderSummary({ children, express = false }: { children?: React.ReactNode; express?: boolean }) {
  const { subtotal, discount, promo } = useStore()
  const delivery = deliveryFee(subtotal, express)
  const rows: [string, string][] = [
    ["Subtotal", formatIDR(subtotal)],
    ["Delivery", delivery ? formatIDR(delivery) : "Free"],
    ...(discount ? [[`Discount (${promo})`, `-${formatIDR(discount)}`] as [string, string]] : []),
  ]
  return (
    <div className="space-y-5 bg-mist p-5 md:p-7">
      <h2 className="font-heading text-2xl font-bold">Order summary</h2>
      <dl className="tabular space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className={k.startsWith("Discount") ? "text-success" : undefined}>{v}</dd>
          </div>
        ))}
        <Separator className="my-4 bg-line" />
        <div className="flex items-baseline justify-between">
          <dt className="font-semibold">Total</dt>
          <dd className="font-heading text-2xl font-bold">{formatIDR(subtotal + delivery - discount)}</dd>
        </div>
      </dl>
      {children}
    </div>
  )
}

export function PromoCodeForm() {
  const { promo, applyPromo } = useStore()
  const [error, setError] = useState<string>()

  if (promo)
    return (
      <div className="flex items-center justify-between bg-background px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Tag className="size-4 text-success" /> {promo} applied
        </span>
        <button
          type="button"
          aria-label="Remove promo code"
          onClick={() => {
            applyPromo(null)
            toast("Promo code removed")
          }}
          className="grid size-8 place-items-center hover:bg-mist"
        >
          <X className="size-4" />
        </button>
      </div>
    )

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const code = String(new FormData(e.currentTarget).get("promo") ?? "")
        const err = applyPromo(code) ?? undefined
        setError(err)
        if (!err) toast("Promo applied", { description: "10% off eligible items." })
      }}
      className="flex items-start gap-2"
    >
      <FormField name="promo" label="Promo code" hint="Try FIELD10" error={error} className="flex-1" autoComplete="off" />
      <Button type="submit" variant="outline" className="mt-[26px] h-12 border-foreground bg-background px-5">
        Apply
      </Button>
    </form>
  )
}

export function AnimatedTotal({ value, className }: { value: string; className?: string }) {
  return (
    <span className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} className="inline-block" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
