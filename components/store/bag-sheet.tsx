"use client"

import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { ShoppingBag } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { BagLine } from "@/components/store/bag-line"
import { EmptyState } from "@/components/store/empty-state"
import { FreeDeliveryMeter } from "@/components/store/free-delivery-meter"
import { useStore } from "@/lib/store"
import { formatIDR } from "@/lib/data"
import { cn } from "@/lib/utils"

export function BagSheet() {
  const { overlay, open, cart } = useStore()
  const close = () => open(null)

  return (
    <Sheet open={overlay === "bag"} onOpenChange={(o) => !o && close()}>
      <SheetContent className="w-full gap-0 p-0 shadow-[0_0_24px_rgba(17,17,17,.12)] sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-heading text-2xl font-bold">
            Your bag <span className="tabular text-muted-foreground">({cart.count})</span>
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <EmptyState icon={<ShoppingBag />} title="Your bag is empty" body="Items you add will show up here.">
            <Link href="/women/all" onClick={close} className={cn(buttonVariants(), "h-12 flex-1 font-heading text-base font-semibold")}>
              Shop women
            </Link>
            <Link href="/men/all" onClick={close} className={cn(buttonVariants({ variant: "outline" }), "h-12 flex-1 border-foreground font-heading text-base font-semibold")}>
              Shop men
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="border-b px-5 py-4">
              <FreeDeliveryMeter subtotal={cart.subtotal} />
            </div>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              <AnimatePresence initial={false}>
                {cart.items.map((l) => (
                  <BagLine key={l.id} line={l} compact />
                ))}
              </AnimatePresence>
            </ul>
            <SheetFooter className="gap-3 border-t px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="tabular font-heading text-xl font-bold">{formatIDR(cart.subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={close} className={cn(buttonVariants(), "h-13 font-heading text-lg font-semibold")}>
                Checkout
              </Link>
              <Link href="/bag" onClick={close} className="text-center text-sm font-medium underline underline-offset-4 hover:no-underline">
                View full bag
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
