export const FREE_DELIVERY = 500000
export const STANDARD_DELIVERY = 25000
export const EXPRESS_DELIVERY = 50000

// ponytail: hard-coded demo code; replace with POST /cart/promo (BAG-5)
export const PROMOS: Record<string, number> = { FIELD10: 0.1 }

type PricedLine = { qty: number; product: { price: number; salePrice?: number; notice?: string } }

export const lineTotal = (l: PricedLine) => l.qty * (l.product.salePrice ?? l.product.price)

export const deliveryFee = (subtotal: number, express = false) =>
  express ? EXPRESS_DELIVERY : subtotal === 0 || subtotal >= FREE_DELIVERY ? 0 : STANDARD_DELIVERY

/** Vouchers skip items flagged "Excluded from vouchers & coupons" (PRD acceptance criteria). */
export const promoDiscount = (lines: PricedLine[], code: string | null) => {
  if (!code || !PROMOS[code]) return 0
  const eligible = lines.filter((l) => !l.product.notice).reduce((n, l) => n + lineTotal(l), 0)
  return Math.round(eligible * PROMOS[code])
}

/** Returns an error message, or null when the code can be applied. */
export const checkPromo = (lines: PricedLine[], code: string) => {
  const c = code.trim().toUpperCase()
  if (!c) return "Enter a promo code."
  if (!PROMOS[c]) return `"${code.trim()}" isn't a valid code or has expired.`
  if (!lines.some((l) => !l.product.notice)) return "This code can't be used on items excluded from vouchers."
  return null
}
