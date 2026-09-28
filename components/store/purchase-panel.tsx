"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/store/color-picker"
import { SizePicker } from "@/components/store/size-picker"
import { WishlistButton } from "@/components/store/wishlist-button"
import { messageOf } from "@/lib/api"
import type { Color, Product } from "@/lib/data"
import { useStore } from "@/lib/store"

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
  const { addToBag, open } = useStore()
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [state, setState] = useState<"idle" | "adding" | "added">("idle")
  const sizeRef = useRef<HTMLDivElement>(null)
  // Stock is per colour; older data only has product-level sizes
  const sizes = color.sizes ?? product.sizes

  const changeColor = (c: Color) => {
    onColorChange(c)
    // keep the chosen size only if the new colour has it in stock
    if (size && !(c.sizes ?? product.sizes).some((s) => s.label === size && s.stock > 0)) setSize(null)
  }

  const submit = async () => {
    if (!size) {
      setError(true)
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      sizeRef.current?.querySelector<HTMLElement>("[role=radio]")?.focus({ preventScroll: true })
      return
    }
    setState("adding")
    try {
      await addToBag({ slug: product.slug, color: color.name, size })
    } catch (e) {
      setState("idle")
      toast.error(messageOf(e))
      return
    }
    setState("added")
    setTimeout(() => {
      setState("idle")
      onAdded?.()
      open("bag")
    }, 700)
  }

  return (
    <div className="space-y-6">
      <ColorPicker colors={product.colors} value={color} onChange={changeColor} id={product.slug} />
      <SizePicker
        ref={sizeRef}
        product={product}
        sizes={sizes}
        colorName={color.name}
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
          onClick={() => void submit()}
          disabled={state !== "idle"}
          className="relative h-13 flex-1 overflow-hidden font-heading text-lg font-semibold transition-transform active:scale-[0.99] disabled:opacity-100"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              className="flex items-center gap-2"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {state === "added" ? (
                <>
                  <Check className="size-5" /> Added
                </>
              ) : state === "adding" ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Adding
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
