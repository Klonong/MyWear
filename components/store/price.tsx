import { cn } from "@/lib/utils"
import { formatIDR, type Product } from "@/lib/data"

export function Price({ product, className }: { product: Product; className?: string }) {
  return (
    <p className={cn("tabular font-heading font-bold", className)}>
      {product.salePrice ? (
        <>
          <span className="whitespace-nowrap text-signal">{formatIDR(product.salePrice)}</span>{" "}
          <s className="font-sans text-sm font-normal whitespace-nowrap text-muted-foreground">{formatIDR(product.price)}</s>
        </>
      ) : (
        formatIDR(product.price)
      )}
    </p>
  )
}
