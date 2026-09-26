"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/store/color-picker"
import { SizePicker } from "@/components/store/size-picker"
import { WishlistButton } from "@/components/store/wishlist-button"
import { useStore } from "@/lib/store"
import type { Color, Product } from "@/lib/data"

/**
 * Colour + size + Add to bag, shared by the product page and the quick view popup.
 * On success it flashes "Added" and opens the bag drawer.
 */
export function PurchasePanel({
  product,
  color,
  onColorChange,
  onAdded,
  addRef,
}: {
  product: Product
  color: Color
  onColorChange: (c: Color) => void
  onAdded?: () => void
  addRef?: React.Ref<HTMLButtonElement>
}) {
  const { add, open } = useStore()
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [added, setAdded] = useState(false)
  const sizeRef = useRef<HTMLDivElement>(null)

  const submit = () => {
    if (!size) {
      setError(true)
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      sizeRef.current?.querySelector<HTMLElement>("[role=radio]")?.focus({ preventScroll: true })
      return
    }
    add({ slug: product.slug, color: color.name, size })
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onAdded?.()
      open("bag")
    }, 700)
  }

  return (
    <div className="space-y-6">
      <ColorPicker colors={product.colors} value={color} onChange={onColorChange} id={product.slug} />
      <SizePicker
        ref={sizeRef}
        product={product}
        value={size}
        error={error}
        onChange={(s) => {
          setSize(s)
          setError(false)
        }}
      />
      <div className="flex gap-2">
        <Button
          ref={addRef}
          onClick={submit}
          disabled={added}
          className="relative h-13 flex-1 overflow-hidden font-heading text-lg font-semibold transition-transform active:scale-[0.99] disabled:opacity-100"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={added ? "added" : "add"}
              className="flex items-center gap-2"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {added ? (
                <>
                  <Check className="size-5" /> Added
                </>
              ) : (
                "Add to bag"
              )}
            </motion.span>
          </AnimatePresence>
        </Button>
        <WishlistButton product={product} className="size-13 border border-foreground transition-colors hover:bg-mist" />
      </div>
    </div>
  )
}
