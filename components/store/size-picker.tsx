"use client"

import { forwardRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@/components/ui/radio-group"
import { NotifyMeDialog } from "@/components/store/notify-me-dialog"
import { SizeGuideDialog } from "@/components/store/size-guide-dialog"
import type { Product } from "@/lib/data"
import { cn } from "@/lib/utils"

/** Size chips (design.md §3.5). Sold-out chips stay clickable and open the Notify me popup. */
export const SizePicker = forwardRef<
  HTMLDivElement,
  { product: Product; value: string | null; onChange: (s: string) => void; error?: boolean }
>(function SizePicker({ product, value, onChange, error }, ref) {
  const [notify, setNotify] = useState<string | null>(null)
  const selected = product.sizes.find((s) => s.label === value)
  const guideTab = product.gender === "kids" ? "Kids" : product.gender === "men" ? "Men" : "Women"

  return (
    <div className="space-y-2.5" ref={ref}>
      <div className="flex items-baseline justify-between">
        <p id={`${product.slug}-size`} className="text-sm font-semibold">
          Size
        </p>
        <SizeGuideDialog defaultTab={guideTab} />
      </div>
      <RadioGroup
        aria-labelledby={`${product.slug}-size`}
        value={value}
        onValueChange={(v) => {
          const s = product.sizes.find((x) => x.label === v)!
          if (s.stock === 0) setNotify(s.label)
          else onChange(s.label)
        }}
        className="grid grid-cols-5 gap-2"
      >
        {product.sizes.map((s) => {
          const out = s.stock === 0
          return (
            <Radio.Root
              key={s.label}
              value={s.label}
              aria-label={out ? `${s.label}, sold out. Get notified` : s.label}
              className={cn(
                "relative grid h-11 place-items-center overflow-hidden border text-[13px] transition-colors duration-[120ms] outline-none",
                "hover:border-foreground/50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                "data-checked:border-foreground data-checked:shadow-[inset_0_0_0_1px_var(--ink)]",
                out && "text-disabled",
              )}
            >
              {s.label}
              {out && (
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--line)_50%,transparent_calc(50%+0.5px))]" />
              )}
            </Radio.Root>
          )
        })}
      </RadioGroup>
      <div aria-live="polite" className="min-h-5 text-sm">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p key="err" className="text-signal" initial={{ x: -6, opacity: 0 }} animate={{ x: [6, -4, 0], opacity: 1 }} exit={{ opacity: 0 }}>
              Select a size
            </motion.p>
          ) : selected && selected.stock <= 3 ? (
            <motion.p key="low" className="text-signal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Only {selected.stock} left in {selected.label}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
      <NotifyMeDialog productName={product.name} size={notify} onClose={() => setNotify(null)} />
    </div>
  )
})
