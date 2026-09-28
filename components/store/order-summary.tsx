"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, Tag, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FormField } from "@/components/store/form-field"
import { messageOf } from "@/lib/api"
import { formatIDR } from "@/lib/data"
import { useStore } from "@/lib/store"

/** Totals come from the API's quote; `express` swaps in the express fee the API priced. */
export function OrderSummary({ children, express = false }: { children?: React.ReactNode; express?: boolean }) {
  const { cart } = useStore()
  const delivery = express ? cart.deliveryOptions.express : cart.deliveryOptions.standard
  const rows: [string, string][] = [
    ["Subtotal", formatIDR(cart.subtotal)],
    ["Delivery", delivery ? formatIDR(delivery) : "Free"],
    ...(cart.discount ? [[`Discount (${cart.promoCode})`, `-${formatIDR(cart.discount)}`] as [string, string]] : []),
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
          <dd className="font-heading text-2xl font-bold">{formatIDR(cart.subtotal - cart.discount + delivery)}</dd>
        </div>
      </dl>
      {children}
    </div>
  )
}

export function PromoCodeForm() {
  const { cart, applyPromo, removePromo } = useStore()
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  if (cart.promoCode)
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between bg-background px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Tag className="size-4 text-success" /> {cart.promoCode} applied
          </span>
          <button
            type="button"
            aria-label="Remove promo code"
            onClick={() =>
              removePromo()
                .then(() => toast("Promo code removed"))
                .catch((e) => toast.error(messageOf(e)))
            }
            className="grid size-8 place-items-center hover:bg-mist"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* The code stopped applying (bag changed, code expired): say why, the API already dropped the discount */}
        {cart.promoError && (
          <p role="alert" className="flex items-center gap-1 text-xs text-signal">
            <AlertCircle className="size-3.5 shrink-0" /> {cart.promoError}
          </p>
        )}
      </div>
    )

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault()
        const code = String(new FormData(e.currentTarget).get("promo") ?? "").trim()
        if (!code) return setError("Enter a promo code.")
        setBusy(true)
        try {
          await applyPromo(code)
          setError(undefined)
          toast("Promo applied")
        } catch (err) {
          setError(messageOf(err))
        } finally {
          setBusy(false)
        }
      }}
      className="flex items-start gap-2"
    >
      <FormField name="promo" label="Promo code" hint="Try FIELD10 or FREESHIP" error={error} className="flex-1" autoComplete="off" />
      <Button type="submit" variant="outline" disabled={busy} className="mt-[26px] h-12 border-foreground bg-background px-5">
        {busy ? "Checking..." : "Apply"}
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
