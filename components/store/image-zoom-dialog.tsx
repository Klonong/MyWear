"use client"

import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ProductImage } from "@/components/store/product-image"
import type { Color } from "@/lib/data"
import { cn } from "@/lib/utils"

/** Full-screen gallery (PDP-2). Arrow keys and thumbnails move between views. */
export function ImageZoomDialog({
  name,
  color,
  views,
  index,
  onIndex,
}: {
  name: string
  color: Color
  views: string[]
  index: number | null
  onIndex: (i: number | null) => void
}) {
  const i = index ?? 0
  const go = (d: number) => onIndex((i + d + views.length) % views.length)

  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogContent
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
        className="h-[100dvh] max-w-none gap-0 bg-studio p-0 ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          {name}, {views[i]} view
        </DialogTitle>
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full max-h-[calc(100dvh-7rem)] aspect-[4/5]"
            >
              <ProductImage color={color} view={i} alt={`${color.name} ${name}, ${views[i]} view`} className="h-full" />
            </motion.div>
          </AnimatePresence>
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              aria-label={d < 0 ? "Previous image" : "Next image"}
              className={cn(
                "absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-background transition-transform active:scale-95",
                d < 0 ? "left-4" : "right-4",
              )}
            >
              {d < 0 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 bg-background p-3">
          {views.map((v, j) => (
            <button
              key={v}
              type="button"
              onClick={() => onIndex(j)}
              aria-label={`Show ${v} view`}
              aria-current={j === i}
              className={cn("w-12 border-b-2 pb-1 transition-opacity", j === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100")}
            >
              <ProductImage color={color} view={j} alt="" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
