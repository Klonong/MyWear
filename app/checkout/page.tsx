"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronDown, CreditCard, Landmark, Loader2, Lock, ShoppingBag, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChoiceCard, ChoiceGroup } from "@/components/store/choice-card"
import { EmptyState } from "@/components/store/empty-state"
import { FormField, validateForm } from "@/components/store/form-field"
import { OrderSummary, PromoCodeForm } from "@/components/store/order-summary"
import { ProductImage } from "@/components/store/product-image"
import { api, ApiError, messageOf, type CheckoutResult } from "@/lib/api"
import { formatIDR } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const STEPS = ["Contact", "Delivery", "Payment", "Review"] as const
type Step = (typeof STEPS)[number]
const PAYMENT_LABEL: Record<string, string> = { card: "Card", ewallet: "E-wallet", va: "Virtual account" }

function StepHeading({ step, current, done, onEdit, summary }: { step: Step; current: Step; done: boolean; onEdit: () => void; summary?: string }) {
  const active = step === current
  return (
    <div className="flex items-center gap-4 py-6">
      <span
        className={cn(
          "tabular grid size-8 shrink-0 place-items-center font-heading text-sm font-bold transition-colors duration-[240ms]",
          done || active ? "bg-foreground text-background" : "border text-muted-foreground",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={done && !active ? "done" : "n"} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            {done && !active ? <Check className="size-4" /> : STEPS.indexOf(step) + 1}
          </motion.span>
        </AnimatePresence>
      </span>
      <div className="min-w-0 flex-1">
        <h2 className={cn("font-heading text-2xl font-bold", !active && !done && "text-muted-foreground")}>{step}</h2>
        {done && !active && summary && <p className="truncate text-sm text-muted-foreground">{summary}</p>}
      </div>
      {done && !active && (
        <button type="button" onClick={onEdit} className="text-sm font-medium underline underline-offset-4 hover:no-underline">
          Edit
        </button>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  const store = useStore()
  const router = useRouter()
  const [step, setStep] = useState<Step>("Contact")
  const [done, setDone] = useState<Step[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [data, setData] = useState<Record<string, string>>({})
  const [method, setMethod] = useState("standard")
  const [payment, setPayment] = useState("card")
  const [placing, setPlacing] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)

  const express = method === "express"
  const { cart } = store
  const fees = cart.deliveryOptions
  const total = cart.subtotal - cart.discount + (express ? fees.express : fees.standard)

  const next = (current: Step) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validateForm(e.currentTarget)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setData({ ...data, ...(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>) })
    setDone((d) => [...new Set([...d, current])])
    setStep(STEPS[STEPS.indexOf(current) + 1])
  }

  const place = async () => {
    setPlacing(true)
    try {
      const { order, payment: gateway } = await api<CheckoutResult>("/checkout", {
        method: "POST",
        body: {
          email: data.email,
          phone: data.phone,
          deliveryMethod: method,
          paymentMethod: payment,
          address: { firstName: data.firstName, lastName: data.lastName, line1: data.line1, line2: data.line2 || undefined, city: data.city, postcode: data.postcode },
        },
      })
      // ponytail: development gateway. A real provider (CHK-5) returns a hosted payment page to redirect to instead.
      if (gateway.confirmUrl) await api(gateway.confirmUrl.replace(/^\/api/, ""), { method: "POST", body: {} })
      try {
        // The confirmation page reads this; the order number in the URL is not enough to show details to a guest
        sessionStorage.setItem("mw-last-order", JSON.stringify({ ...order, status: gateway.confirmUrl ? "paid" : order.status }))
      } catch {}
      await store.refreshCart().catch(() => undefined)
      router.push(`/order/${order.number}/confirmation`)
    } catch (e) {
      setPlacing(false)
      toast.error(messageOf(e))
      // stock or promo changed under us: reload the bag so its warnings show
      if (e instanceof ApiError && (e.status === 409 || e.status === 422)) await store.refreshCart().catch(() => undefined)
    }
  }

  if (!store.ready)
    return (
      <div className="flex justify-center py-24" aria-busy="true" aria-label="Loading checkout">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )

  if (cart.items.length === 0 && !placing)
    return (
      <EmptyState icon={<ShoppingBag />} title="Your bag is empty" body="Add something to your bag before checking out." className="py-24">
        <Link href="/" className={cn(buttonVariants(), "h-12 w-full font-heading text-base font-semibold")}>
          Continue shopping
        </Link>
      </EmptyState>
    )

  const summaryLines = (
    <ul className="space-y-4">
      {cart.items.map((l) => (
        <li key={l.id} className="flex gap-3 text-sm">
          <div className="relative w-16 shrink-0">
            <ProductImage color={{ name: l.color, hex: l.colorHex, tone: l.colorTone, image: l.image }} alt="" />
            <span className="tabular absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-foreground text-[11px] text-background">{l.qty}</span>
          </div>
          <div className="flex-1">
            <p className="leading-snug font-medium">{l.name}</p>
            <p className="text-xs text-muted-foreground">
              {l.color}, {l.size}
            </p>
          </div>
          <p className="tabular">{formatIDR(l.lineTotal)}</p>
        </li>
      ))}
    </ul>
  )

  const summaries: Partial<Record<Step, string>> = {
    Contact: data.email,
    Delivery: data.line1 && `${data.firstName} ${data.lastName}, ${data.line1}, ${data.city}`,
    Payment: PAYMENT_LABEL[payment],
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-20 md:px-10">
      {/* Mobile collapsible summary */}
      <button
        type="button"
        aria-expanded={summaryOpen}
        onClick={() => setSummaryOpen(!summaryOpen)}
        className="-mx-4 flex w-[calc(100%+2rem)] items-center justify-between border-b bg-mist px-4 py-4 text-sm font-medium md:hidden"
      >
        <span className="flex items-center gap-1">
          {summaryOpen ? "Hide" : "Show"} order summary <ChevronDown className={cn("size-4 transition-transform duration-[240ms]", summaryOpen && "rotate-180")} />
        </span>
        <span className="tabular font-heading text-lg font-bold">{formatIDR(total)}</span>
      </button>
      <AnimatePresence initial={false}>
        {summaryOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="-mx-4 overflow-hidden border-b bg-mist md:hidden">
            <div className="p-4">{summaryLines}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-12 lg:gap-16">
        <div className="md:col-span-7">
          <h1 className="font-heading text-[2.5rem] leading-none font-bold">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Have an account?{" "}
            <button type="button" onClick={() => store.open("auth")} className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
              Sign in
            </button>{" "}
            for faster checkout. Guests are welcome.
          </p>

          <Accordion value={[step]} className="mt-8 border-t">
            <AccordionItem value="Contact" className="border-b">
              <StepHeading step="Contact" current={step} done={done.includes("Contact")} onEdit={() => setStep("Contact")} summary={summaries.Contact} />
              <AccordionContent>
                <form noValidate onSubmit={next("Contact")} className="grid gap-4 pb-8">
                  <FormField name="email" label="Email" type="email" required data-label="email" autoComplete="email" hint="For your receipt and delivery updates" defaultValue={data.email ?? store.user?.email} error={errors.email} />
                  <FormField name="phone" label="Phone" type="tel" required pattern="[0-9 +]{9,16}" data-label="phone number" autoComplete="tel" defaultValue={data.phone ?? store.user?.phone ?? undefined} error={errors.phone} />
                  <Button type="submit" className="mt-2 h-13 font-heading text-lg font-semibold active:scale-[0.99]">
                    Continue to delivery
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="Delivery" className="border-b">
              <StepHeading step="Delivery" current={step} done={done.includes("Delivery")} onEdit={() => setStep("Delivery")} summary={summaries.Delivery} />
              <AccordionContent>
                <form noValidate onSubmit={next("Delivery")} className="grid gap-4 pb-8 sm:grid-cols-2">
                  <ChoiceGroup label="Delivery method" value={method} onChange={setMethod} className="grid gap-2 sm:col-span-2">
                    <ChoiceCard value="standard" title="Standard delivery" detail="2 to 4 working days" aside={fees.standard ? formatIDR(fees.standard) : "Free"} />
                    <ChoiceCard value="express" title="Express delivery" detail="Next working day in Jabodetabek" aside={fees.express ? formatIDR(fees.express) : "Free"} />
                  </ChoiceGroup>
                  <FormField name="firstName" label="First name" required data-label="first name" autoComplete="given-name" defaultValue={data.firstName} error={errors.firstName} />
                  <FormField name="lastName" label="Last name" required data-label="last name" autoComplete="family-name" defaultValue={data.lastName} error={errors.lastName} />
                  <FormField name="line1" label="Address" required data-label="address" autoComplete="address-line1" className="sm:col-span-2" defaultValue={data.line1} error={errors.line1} />
                  <FormField name="line2" label="Apartment, unit (optional)" autoComplete="address-line2" className="sm:col-span-2" defaultValue={data.line2} />
                  <FormField name="city" label="City" required data-label="city" autoComplete="address-level2" defaultValue={data.city} error={errors.city} />
                  <FormField name="postcode" label="Postcode" required pattern="[0-9]{5}" inputMode="numeric" data-label="postcode" autoComplete="postal-code" defaultValue={data.postcode} error={errors.postcode} />
                  <Button type="submit" className="mt-2 h-13 font-heading text-lg font-semibold active:scale-[0.99] sm:col-span-2">
                    Continue to payment
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="Payment" className="border-b">
              <StepHeading step="Payment" current={step} done={done.includes("Payment")} onEdit={() => setStep("Payment")} summary={summaries.Payment} />
              <AccordionContent>
                <form noValidate onSubmit={next("Payment")} className="grid gap-4 pb-8">
                  <ChoiceGroup label="Payment method" value={payment} onChange={setPayment} className="grid gap-2">
                    <ChoiceCard value="card" title="Credit or debit card" detail="Visa, Mastercard, JCB" aside={<CreditCard className="size-5" strokeWidth={1.5} />} />
                    <ChoiceCard value="ewallet" title="E-wallet" detail="GoPay, OVO, DANA, ShopeePay" aside={<Wallet className="size-5" strokeWidth={1.5} />} />
                    <ChoiceCard value="va" title="Virtual account" detail="BCA, Mandiri, BNI, BRI" aside={<Landmark className="size-5" strokeWidth={1.5} />} />
                  </ChoiceGroup>
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Lock className="mt-0.5 size-3.5 shrink-0" /> You&apos;ll finish paying on our partner&apos;s secure page. We never store card details.
                  </p>
                  <Button type="submit" className="mt-2 h-13 font-heading text-lg font-semibold active:scale-[0.99]">
                    Review order
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="Review" className="border-b">
              <StepHeading step="Review" current={step} done={false} onEdit={() => {}} />
              <AccordionContent>
                <div className="space-y-6 pb-8 text-sm">
                  <dl className="grid gap-4 bg-mist p-5 sm:grid-cols-3">
                    {[
                      ["Contact", [data.email, data.phone]],
                      ["Deliver to", [`${data.firstName} ${data.lastName}`, `${data.line1}, ${data.city} ${data.postcode}`, express ? "Express" : "Standard"]],
                      ["Payment", [PAYMENT_LABEL[payment]]],
                    ].map(([title, rows]) => (
                      <div key={title as string} className="space-y-0.5">
                        <dt className="mb-1 text-xs font-semibold text-muted-foreground">{title as string}</dt>
                        {(rows as string[]).map((r) => (
                          <dd key={r}>{r}</dd>
                        ))}
                      </div>
                    ))}
                  </dl>
                  <Button onClick={place} disabled={placing} className="h-14 w-full font-heading text-lg font-semibold active:scale-[0.99] disabled:opacity-90">
                    {placing ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Placing order
                      </>
                    ) : (
                      `Place order, ${formatIDR(total)}`
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    By placing your order you agree to our{" "}
                    <Link href="#" className="underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline">
                      Privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <aside className="md:col-span-5">
          <div className="space-y-4 md:sticky md:top-8">
            <OrderSummary express={express}>
              <div className="hidden md:block">{summaryLines}</div>
              <PromoCodeForm />
            </OrderSummary>
          </div>
        </aside>
      </div>
    </div>
  )
}
