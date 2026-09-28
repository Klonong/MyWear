import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "./product-detail"
import { ProductRail } from "@/components/store/product-rail"
import { getProduct, getReviews } from "@/lib/api"

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug)
  return p ? { title: `${p.name} | MyWear`, description: p.blurb } : {}
}

export default async function Page({ params, searchParams }: PageProps<"/product/[slug]">) {
  const { slug } = await params
  const [product, reviews] = await Promise.all([getProduct(slug), getReviews(slug).catch(() => null)])
  if (!product) notFound()
  const { color } = await searchParams
  const inStock = product.sizes.some((s) => s.stock > 0)

  // PDP-15 structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.salePrice ?? product.price,
      availability: `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`,
    },
    ...(product.reviews > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews } }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} reviews={reviews} initialColor={typeof color === "string" ? color : undefined} />
      <div className="mt-20 space-y-20 md:mt-28">
        <ProductRail title="Complete the look" products={product.completeTheLook} />
        <ProductRail title="You may also like" products={product.youMayAlsoLike} />
      </div>
    </>
  )
}
