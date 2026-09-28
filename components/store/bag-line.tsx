"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { AlertCircle, Heart, X } from "lucide-react"
import { toast } from "sonner"
import { ProductImage } from "@/components/store/product-image"
import { QuantityStepper } from "@/components/store/quantity-stepper"
import { messageOf } from "@/lib/api"
import { formatIDR } from "@/lib/data"
import { useStore, type CartItem } from "@/lib/store"
import { cn } from "@/lib/utils"

/** One bag item. Used full-size on /bag and compact in the bag drawer. Remove and Move to wishlist both toast with Undo. */
export function BagLine({ line, compact }: { line: CartItem; compact?: boolean }) {
  const { setQty, removeItem, addToBag, setSaved } = useStore()
  const color = { name: line.color, hex: line.colorHex, tone: line.colorTone, image: line.image }
  const href = `/product/${line.slug}?color=${encodeURIComponent(line.color)}`
  const undo = { label: "Undo", onClick: () => void addToBag(line, line.qty).catch((e) => toast.error(messageOf(e))) }

  const run = (action: () => Promise<unknown>, done?: string) =>
    action()
      .then(() => done && toast(done, { description: line.name, action: undo }))
      .catch((e) => toast.error(messageOf(e)))

  const removeLine = () => run(() => removeItem(line.id), "Removed from bag")
  const moveToWishlist = () => run(() => Promise.all([removeItem(line.id), setSaved(line.slug, true)]), "Moved to wishlist")

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      className={cn("flex gap-4", compact ? "py-4" : "py-6")}
    >
      <Link href={href} className={cn("shrink-0 overflow-hidden", compact ? "w-20" : "w-28 md:w-36")}>
        <ProductImage
          color={color}
          alt={`${line.name}, ${line.color}`}
          className={cn("transition-transform duration-500 hover:scale-105", line.issue === "sold_out" && "opacity-50")}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className={cn("leading-snug hover:underline", compact ? "text-sm" : "font-medium")}>
            {line.name}
          </Link>
          {compact ? (
            <button type="button" onClick={removeLine} aria-label={`Remove ${line.name}`} className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center hover:bg-mist">
              <X className="size-4" />
            </button>
          ) : (
            <p className="tabular shrink-0 font-heading text-lg font-bold">{formatIDR(line.lineTotal)}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground md:text-sm">
          {line.color}, {line.size}
        </p>
        {!compact && <p className="tabular text-sm text-muted-foreground">{formatIDR(line.unitPrice)} each</p>}
        {line.issue && (
          <p role="alert" className="flex items-center gap-1 text-xs text-signal">
            <AlertCircle className="size-3.5 shrink-0" />
            {line.issue === "sold_out" ? "Sold out. Remove it to check out." : `Only ${line.available} left. Lower the quantity to check out.`}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
          <QuantityStepper
            size={compact ? "sm" : "md"}
            value={line.qty}
            max={Math.max(line.qty, line.maxQty)}
            onChange={(n) => void run(() => setQty(line.id, n))}
          />
          {compact ? (
            <p className="tabular ml-auto text-sm font-semibold">{formatIDR(line.lineTotal)}</p>
          ) : (
            <>
              <button type="button" onClick={removeLine} className="text-sm underline underline-offset-4 hover:no-underline">
                Remove
              </button>
              <button type="button" onClick={moveToWishlist} className="flex items-center gap-1 text-sm underline underline-offset-4 hover:no-underline">
                <Heart className="size-4" strokeWidth={1.5} /> Move to wishlist
              </button>
            </>
          )}
        </div>
      </div>
    </motion.li>
  )
}
