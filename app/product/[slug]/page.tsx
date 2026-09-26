import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "./product-detail"
import { ProductRail } from "@/components/store/product-rail"
import { getProduct, PRODUCTS } from "@/lib/data"

export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = getProduct((await params).slug)
  return p ? { title: `${p.name} | FIELDWEAR`, description: p.blurb } : {}
}

export default async function Page({ params, searchParams }: PageProps<"/product/[slug]">) {
  const product = getProduct((await params).slug)
  if (!product) notFound()
  const { color } = await searchParams

  const others = PRODUCTS.filter((p) => p.slug !== product.slug)
  const look = others.filter((p) => p.gender === product.gender).slice(0, 6)
  const also = others.filter((p) => p.sport === product.sport).slice(0, 6)

  // PDP-15 structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    offers: { "@type": "Offer", priceCurrency: "IDR", price: product.salePrice ?? product.price, availability: "https://schema.org/InStock" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} initialColor={typeof color === "string" ? color : undefined} />
      <div className="mt-20 space-y-20 md:mt-28">
        <ProductRail title="Complete the look" products={look} />
        <ProductRail title="You may also like" products={also} />
      </div>
    </>
  )
}
