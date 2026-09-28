"use client"

import { useSyncExternalStore } from "react"
import type { Order } from "@/lib/api"
import { formatIDR } from "@/lib/data"

const readLastOrder = () => {
  try {
    return sessionStorage.getItem("mw-last-order")
  } catch {
    return null
  }
}

/** Items and totals of the order just placed, handed over by checkout in sessionStorage. Renders nothing otherwise. */
export function OrderRecap({ number }: { number: string }) {
  const raw = useSyncExternalStore(
    () => () => {},
    readLastOrder,
    () => null,
  )
  const order = raw ? (JSON.parse(raw) as Order) : null
  if (!order || order.number !== number) return null

  return (
    <div className="mt-10 space-y-5 bg-mist p-5 text-left md:p-7">
      <ul className="space-y-3 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4">
            <span>
              {i.name} <span className="text-muted-foreground">({i.color}, {i.size}) x {i.qty}</span>
            </span>
            <span className="tabular shrink-0">{formatIDR(i.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="tabular space-y-1.5 border-t border-line pt-4 text-sm">
        {[
          ["Subtotal", formatIDR(order.subtotal)],
          ["Delivery", order.shipping ? formatIDR(order.shipping) : "Free"],
          ...(order.discount ? [[`Discount (${order.promoCode})`, `-${formatIDR(order.discount)}`]] : []),
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className="flex justify-between pt-2 font-heading text-xl font-bold">
          <dt>Total</dt>
          <dd>{formatIDR(order.total)}</dd>
        </div>
      </dl>
      <p className="border-t border-line pt-4 text-sm text-muted-foreground">
        Delivering to {order.address.recipient}, {order.address.line1}, {order.address.city} {order.address.postcode}. Receipt sent to {order.email}.
      </p>
    </div>
  )
}
