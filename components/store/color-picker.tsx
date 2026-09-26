"use client"

import { motion } from "motion/react"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@/components/ui/radio-group"
import { ProductImage } from "@/components/store/product-image"
import type { Color } from "@/lib/data"

/** Colour selector as mini product thumbnails with a sliding ink bar (design.md §3.6). */
export function ColorPicker({ colors, value, onChange, id = "color" }: { colors: Color[]; value: Color; onChange: (c: Color) => void; id?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm">
        <span className="font-semibold">Colour</span> <span className="text-muted-foreground">{value.name}</span>
      </p>
      <RadioGroup
        aria-label="Colour"
        value={value.name}
        onValueChange={(v) => onChange(colors.find((c) => c.name === v)!)}
        className="flex flex-wrap gap-2"
      >
        {colors.map((c) => (
          <Radio.Root
            key={c.name}
            value={c.name}
            aria-label={c.name}
            className="group relative w-16 pb-1.5 outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          >
            <ProductImage color={c} alt="" className="transition-transform duration-[240ms] group-hover:scale-[1.03]" />
            {c.name === value.name && (
              <motion.span layoutId={`${id}-bar`} className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
            )}
          </Radio.Root>
        ))}
      </RadioGroup>
    </div>
  )
}
