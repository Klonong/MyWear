"use client"

import { motion } from "motion/react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import type { Product } from "@/lib/data"
import { cn } from "@/lib/utils"

/** Heart toggle. Confirms with a toast that offers Undo, or View to open the wishlist drawer. */
export function WishlistButton({ product, className, iconClassName }: { product: Product; className?: string; iconClassName?: string }) {
  const { isSaved, setSaved, open } = useStore()
  const saved = isSaved(product.slug)

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const on = !saved
    setSaved(product.slug, on)
    toast(on ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.name,
      action: on
        ? { label: "View", onClick: () => open("wishlist") }
        : { label: "Undo", onClick: () => setSaved(product.slug, true) },
    })
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={onClick}
      className={cn("grid size-11 place-items-center", className)}
    >
      <motion.span
        key={String(saved)}
        initial={{ scale: saved ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 15 }}
        className="grid"
      >
        <Heart className={cn("size-5", saved && "fill-signal text-signal", iconClassName)} strokeWidth={1.5} />
      </motion.span>
    </button>
  )
}
