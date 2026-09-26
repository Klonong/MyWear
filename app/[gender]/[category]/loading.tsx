import { ProductCardSkeleton } from "@/components/store/product-card"

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 md:px-10" aria-busy="true" aria-label="Loading products">
      <div className="h-4 w-40 animate-pulse bg-mist" />
      <div className="mt-4 h-10 w-72 animate-pulse bg-mist" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
