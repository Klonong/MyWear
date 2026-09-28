import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { SuccessMark } from "@/components/store/success-mark"
import { cn } from "@/lib/utils"
import { OrderRecap } from "./order-recap"

export default async function Page({ params }: PageProps<"/order/[id]/confirmation">) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <SuccessMark />
      <h1 className="mt-6 font-heading text-[2.5rem] leading-none font-bold">Thanks, your order is confirmed</h1>
      <p className="mt-4 text-[15px] text-muted-foreground">
        Order <span className="tabular font-semibold text-foreground">{id}</span> is on its way to the warehouse. We&apos;ve emailed your receipt. Expect
        delivery in 2 to 4 working days.
      </p>
      <OrderRecap number={id} />
      <div className="mt-10 grid grid-cols-2 gap-3">
        <Link href="#" className={cn(buttonVariants(), "h-13 font-heading text-base font-semibold")}>
          Track order
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-13 border-foreground font-heading text-base font-semibold")}>
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
