import type { Metadata } from "next"
import { ProductForm } from "./product-form"

export const metadata: Metadata = { title: "Add product | MyWear admin" }

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">Catalogue</p>
      <h1 className="mt-1 font-heading text-[2.5rem] leading-none font-bold">Add product</h1>
      <p className="mt-3 max-w-xl text-[15px] text-muted-foreground">
        Photos upload to the image bucket as you add them. The product goes live when you publish.
      </p>
      <ProductForm />
    </div>
  )
}
