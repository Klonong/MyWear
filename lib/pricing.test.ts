// Run: node --test lib/pricing.test.ts
import assert from "node:assert/strict"
import { test } from "node:test"
import { checkPromo, deliveryFee, promoDiscount } from "./pricing.ts"

const tee = { qty: 2, product: { price: 249000 } }
const excluded = { qty: 1, product: { price: 1090000, notice: "Excluded from vouchers & coupons" } }
const onSale = { qty: 1, product: { price: 399000, salePrice: 299000 } }

test("delivery is free at the threshold and for an empty bag", () => {
  assert.equal(deliveryFee(0), 0)
  assert.equal(deliveryFee(499999), 25000)
  assert.equal(deliveryFee(500000), 0)
  assert.equal(deliveryFee(100, true), 50000)
})

test("promo skips voucher-excluded items and uses sale price", () => {
  assert.equal(promoDiscount([tee, excluded, onSale], "FIELD10"), Math.round((2 * 249000 + 299000) * 0.1))
  assert.equal(promoDiscount([excluded], "FIELD10"), 0)
  assert.equal(promoDiscount([tee], null), 0)
  assert.equal(promoDiscount([tee], "NOPE"), 0)
})

test("promo validation messages", () => {
  assert.equal(checkPromo([tee], " field10 "), null)
  assert.match(checkPromo([tee], "SUMMER")!, /isn't a valid code/)
  assert.match(checkPromo([excluded], "FIELD10")!, /excluded from vouchers/)
  assert.equal(checkPromo([tee], "  "), "Enter a promo code.")
})
