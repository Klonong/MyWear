"use client"

import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { ShieldCheck, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { BagLine } from "@/components/store/bag-line"
import { ConfirmDialog } from "@/components/store/confirm-dialog"
import { EmptyState } from "@/components/store/empty-state"
import { FreeDeliveryMeter } from "@/components/store/free-delivery-meter"
import { AnimatedTotal, OrderSummary, PromoCodeForm } from "@/components/store/order-summary"
import { ProductRail } from "@/components/store/product-rail"
import { useStore } from "@/lib/store"
import { formatIDR, PRODUCTS } from "@/lib/data"
import { deliveryFee } from "@/lib/pricing"
import { cn, plural } from "@/lib/utils"

export default function BagPage() {
  const { lines, count, subtotal, discount, clear, wishlist } = useStore()
  const total = subtotal + deliveryFee(subtotal) - discount

  if (lines.length === 0)
    return (
      <div className="space-y-16 pt-10">
        <EmptyState icon={<ShoppingBag />} title="Your bag is empty" body="Find something you love and it will show up here.">
          <Link href="/women/all" className={cn(buttonVariants(), "h-13 flex-1 font-heading text-base font-semibold")}>
            Shop women
          </Link>
          <Link href="/men/all" className={cn(buttonVariants({ variant: "outline" }), "h-13 flex-1 border-foreground font-heading text-base font-semibold")}>
            Shop men
          </Link>
        </EmptyState>
        <ProductRail title={wishlist.length ? "From your wishlist" : "Popular right now"} products={wishlist.length ? wishlist : PRODUCTS.slice(0, 6)} />
      </div>
    )

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-28 md:px-10 md:pb-0">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-[2.25rem] leading-none font-bold md:text-[3rem]">
          Your bag <span className="tabular align-top font-sans text-base font-normal text-muted-foreground">{count}</span>
        </h1>
        <ConfirmDialog
          trigger={<button type="button" className="text-sm underline underline-offset-4 hover:no-underline" />}
          title="Clear your bag?"
          body={`This removes ${plural(count, "item")} from your bag. You can't undo this.`}
          confirm="Clear bag"
          onConfirm={() => {
            clear()
            toast("Bag cleared")
          }}
        >
          Clear bag
        </ConfirmDialog>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-12 lg:gap-16">
        <div className="md:col-span-7 lg:col-span-8">
          <div className="border-b pb-5">
            <FreeDeliveryMeter subtotal={subtotal} />
          </div>
          <ul className="divide-y">
            <AnimatePresence initial={false}>
              {lines.map((l, i) => (
                <BagLine key={`${l.slug}-${l.color}-${l.size}`} line={l} index={i} />
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <aside className="md:col-span-5 lg:col-span-4">
          <div className="space-y-4 md:sticky md:top-24">
            <OrderSummary>
              <PromoCodeForm />
              <Link href="/checkout" className={cn(buttonVariants(), "hidden h-13 w-full font-heading text-lg font-semibold active:scale-[0.99] md:flex")}>
                Checkout
              </Link>
            </OrderSummary>
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" strokeWidth={1.5} /> Secure payment. Free returns within 30 days.
            </p>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-background/95 p-3 backdrop-blur-md md:hidden">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <AnimatedTotal value={formatIDR(total)} className="tabular font-heading text-lg font-bold" />
        </div>
        <Link href="/checkout" className={cn(buttonVariants(), "h-12 flex-1 font-heading text-base font-semibold")}>
          Checkout
        </Link>
      </div>
    </div>
  )
}
