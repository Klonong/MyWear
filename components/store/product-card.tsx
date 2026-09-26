"use client"

import Link from "next/link"
import { Plus, Star } from "lucide-react"
import { ProductImage } from "@/components/store/product-image"
import { Price } from "@/components/store/price"
import { WishlistButton } from "@/components/store/wishlist-button"
import { useStore } from "@/lib/store"
import { sizeRange, type Product } from "@/lib/data"

export function ProductCard({ product }: { product: Product }) {
  const { openQuickView } = useStore()
  const href = `/product/${product.slug}`

  return (
    <article className="group relative">
      <div className="relative overflow-hidden bg-studio">
        <Link href={href} className="block" aria-label={product.name}>
          <ProductImage
            color={product.colors[0]}
            alt={`${product.name}, ${product.colors[0].name}`}
            className="transition-transform duration-500 ease-[cubic-bezier(.2,0,0,1)] group-hover:scale-[1.04]"
          />
          {/* Second view fades in on hover (PLP-2) */}
          <ProductImage
            color={product.colors[1] ?? product.colors[0]}
            view={1}
            alt=""
            className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </Link>
        {product.badge && (
          <span className="pointer-events-none absolute top-3 left-3 bg-background px-2 py-1 text-[11px] font-semibold">
            <span className={product.badge === "Sale" ? "text-signal" : undefined}>{product.badge}</span>
          </span>
        )}
        <WishlistButton product={product} className="absolute top-1 right-1" />
        <button
          type="button"
          onClick={() => openQuickView(product.slug)}
          aria-label={`Quick add ${product.name}`}
          className="absolute right-2 bottom-2 grid size-10 place-items-center bg-background shadow-[0_2px_10px_rgba(17,17,17,.08)] transition-all duration-[240ms] active:scale-95 md:inset-x-2 md:bottom-2 md:flex md:size-auto md:h-11 md:translate-y-3 md:gap-2 md:text-sm md:font-semibold md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:hover:bg-foreground md:hover:text-background"
        >
          <Plus className="size-4" /> <span className="hidden md:inline">Quick add</span>
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-1.5">
          {product.colors.slice(0, 5).map((c) => (
            <span key={c.name} title={c.name} className="size-2.5 rounded-full ring-1 ring-line" style={{ background: c.hex }} />
          ))}
          {product.colors.length > 5 && <span className="text-xs text-muted-foreground">+{product.colors.length - 5}</span>}
          <span className="ml-auto text-xs text-muted-foreground capitalize">
            {product.gender}, {sizeRange(product)}
          </span>
        </div>
        <Link href={href} className="line-clamp-2 block text-sm leading-snug decoration-1 underline-offset-4 hover:underline">
          {product.name}
        </Link>
        <Price product={product} className="text-lg" />
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-current text-foreground" /> {product.rating} ({product.reviews})
        </p>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] animate-pulse bg-studio" />
      <div className="h-3 w-1/3 animate-pulse bg-mist" />
      <div className="h-4 w-4/5 animate-pulse bg-mist" />
      <div className="h-5 w-2/5 animate-pulse bg-mist" />
    </div>
  )
}
