"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { validateForm } from "@/components/store/form-field"
import { Logo } from "@/components/store/site-header"

const COLUMNS = {
  Help: ["FAQ", "Delivery", "Returns", "Size guide"],
  Account: ["Sign in", "Orders", "Wishlist", "Order status"],
  About: ["Our story", "Sustainability", "Careers", "Stores"],
  "Follow us": ["Instagram", "TikTok", "YouTube", "Strava"],
}

function Newsletter() {
  const [error, setError] = useState<string>()
  return (
    <form
      noValidate
      className="max-w-md"
      onSubmit={(e) => {
        e.preventDefault()
        const errs = validateForm(e.currentTarget)
        setError(errs.email)
        if (errs.email) return
        e.currentTarget.reset()
        // ponytail: POST to newsletter provider with double opt-in (CNT-3)
        toast("Check your inbox", { description: "Confirm your email to start getting new drops." })
      }}
    >
      <h2 className="font-heading text-[1.75rem] leading-tight font-bold">New drops, first.</h2>
      <p className="mt-1 text-sm text-muted-foreground">Launches and member offers. No spam, unsubscribe anytime.</p>
      <label htmlFor="newsletter" className="sr-only">
        Email
      </label>
      <div className="mt-4 flex border-b-2 border-foreground focus-within:border-foreground">
        <input
          id="newsletter"
          name="email"
          type="email"
          required
          data-label="email"
          placeholder="Email address"
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" aria-label="Sign up" className="group grid size-12 place-items-center">
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-signal">
          {error}
        </p>
      )}
    </form>
  )
}

export function SiteFooter() {
  if (usePathname() === "/checkout") return null

  const links = (items: string[]) => (
    <ul className="space-y-2.5 text-sm text-muted-foreground">
      {items.map((l) => (
        <li key={l}>
          <Link href="#" className="transition-colors hover:text-foreground">
            {l}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <footer className="mt-24 bg-mist">
      <div className="mx-auto max-w-[1440px] px-4 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <Newsletter />
          <div className="hidden grid-cols-4 gap-6 md:grid">
            {Object.entries(COLUMNS).map(([title, items]) => (
              <div key={title}>
                <h2 className="mb-4 text-sm font-semibold">{title}</h2>
                {links(items)}
              </div>
            ))}
          </div>
          <Accordion className="md:hidden">
            {Object.entries(COLUMNS).map(([title, items]) => (
              <AccordionItem key={title} value={title} className="border-b border-line">
                <AccordionTrigger className="py-4 text-[15px] font-semibold">{title}</AccordionTrigger>
                <AccordionContent>{links(items)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8 text-xs text-muted-foreground">
          <Logo />
          <p className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "GoPay", "OVO", "BCA VA"].map((p) => (
              <span key={p} className="bg-background px-2.5 py-1.5 font-medium text-foreground">
                {p}
              </span>
            ))}
          </p>
          <p className="flex gap-5">
            <span>&copy; 2026 Fieldwear</span>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
