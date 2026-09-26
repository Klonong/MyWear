"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { Heart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { EmptyState } from "@/components/store/empty-state"
import { Price } from "@/components/store/price"
import { ProductImage } from "@/components/store/product-image"
import { useStore } from "@/lib/store"

export function WishlistSheet() {
  const { overlay, open, wishlist, setSaved, openQuickView } = useStore()
  const close = () => open(null)

  return (
    <Sheet open={overlay === "wishlist"} onOpenChange={(o) => !o && close()}>
      <SheetContent className="w-full gap-0 p-0 shadow-[0_0_24px_rgba(17,17,17,.12)] sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-heading text-2xl font-bold">
            Wishlist <span className="tabular text-muted-foreground">({wishlist.length})</span>
          </SheetTitle>
        </SheetHeader>
        {wishlist.length === 0 ? (
          <EmptyState icon={<Heart />} title="Nothing saved yet" body="Tap the heart on any item to keep it here." />
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-5">
            <AnimatePresence initial={false}>
              {wishlist.map((p) => (
                <motion.li key={p.slug} layout exit={{ opacity: 0, x: 24 }} className="flex gap-4 py-4">
                  <Link href={`/product/${p.slug}`} onClick={close} className="w-20 shrink-0">
                    <ProductImage color={p.colors[0]} alt={p.name} />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${p.slug}`} onClick={close} className="text-sm leading-snug hover:underline">
                        {p.name}
                      </Link>
                      <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setSaved(p.slug, false)} className="-mt-1 -mr-2 grid size-8 shrink-0 place-items-center hover:bg-mist">
                        <X className="size-4" />
                      </button>
                    </div>
                    <Price product={p} className="text-base" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        close()
                        openQuickView(p.slug)
                      }}
                      className="mt-auto h-9 w-fit border-foreground px-4 text-xs font-semibold"
                    >
                      Add to bag
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </SheetContent>
    </Sheet>
  )
}
