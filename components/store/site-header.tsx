"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { ArrowRight, ChevronRight, Heart, Lock, Menu, Package, Search, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { IconButton } from "@/components/store/icon-button"
import { CATEGORIES, GENDERS, NAV, photo, type Gender } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const hrefFor = (item: string) => {
  const g = item.toLowerCase()
  return GENDERS.includes(g as Gender) ? `/${g}/all` : "/women/all"
}

export function Logo() {
  return (
    <Link href="/" className="font-heading text-2xl font-bold tracking-[0.08em] uppercase">
      Fieldwear
    </Link>
  )
}

function AccountMenu() {
  const { open } = useStore()
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button type="button" aria-label="Account" className="hidden size-11 place-items-center transition-transform active:scale-95 md:grid">
            <User className="size-6" strokeWidth={1.5} />
          </button>
        }
      />
      <PopoverContent align="end" sideOffset={8} className="w-72 gap-4 p-5 shadow-[0_8px_30px_rgba(17,17,17,.12)]">
        <div>
          <p className="font-heading text-xl font-bold">Hello there</p>
          <p className="text-sm text-muted-foreground">Sign in for order tracking and faster checkout.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => open("auth")} className="h-11 font-semibold">
            Sign in
          </Button>
          <Button variant="outline" onClick={() => open("auth")} className="h-11 border-foreground font-semibold">
            Join
          </Button>
        </div>
        <div className="-mx-2 border-t pt-2">
          {[
            [Package, "Order status"],
            [Heart, "Wishlist"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Package
            return (
              <button
                key={label as string}
                type="button"
                onClick={() => label === "Wishlist" && open("wishlist")}
                className="flex h-10 w-full items-center gap-3 px-2 text-sm hover:bg-mist"
              >
                <I className="size-4" strokeWidth={1.5} /> {label as string}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MegaMenu({ gender }: { gender: string }) {
  return (
    <div className="invisible absolute inset-x-0 top-full translate-y-1 border-t bg-background opacity-0 shadow-[0_24px_24px_-12px_rgba(17,17,17,.1)] transition-all duration-[240ms] ease-[cubic-bezier(.2,0,0,1)] group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(5,1fr)_1.4fr] gap-8 px-10 py-10">
        {CATEGORIES.slice(0, 5).map((c) => (
          <div key={c}>
            <Link href={`/${gender}/${c.toLowerCase()}`} className="font-heading text-lg font-bold hover:underline">
              {c}
            </Link>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {["New arrivals", "Best sellers", "View all"].map((s) => (
                <li key={s}>
                  <Link href={`/${gender}/${c.toLowerCase()}`} className="transition-colors hover:text-foreground">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link href={`/${gender}/all`} className="group/tile relative aspect-[4/3] overflow-hidden bg-studio">
          <Image src={photo(786, 600, 450)} alt="Fall running edit" fill sizes="320px" className="object-cover transition-transform duration-700 group-hover/tile:scale-105" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 font-heading text-xl font-bold text-white">
            Fall running edit <ArrowRight className="size-5" />
          </span>
        </Link>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { open, count, wishlist } = useStore()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // NAV-6: hide on scroll down, reveal on scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 160)
  })

  if (pathname === "/checkout")
    return (
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-10">
          <Logo />
          <p className="flex items-center gap-2 text-sm font-medium">
            <Lock className="size-4" strokeWidth={1.5} /> Secure checkout
          </p>
        </div>
      </header>
    )

  return (
    <>
      <div className="hidden bg-foreground text-background md:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-10 text-xs">
          <p>Free delivery on orders over IDR 500,000. Free returns within 30 days.</p>
          <nav aria-label="Utility" className="flex gap-5 text-background/80">
            <Link href="#" className="hover:text-background">Help</Link>
            <Link href="#" className="hover:text-background">Order status</Link>
            <button type="button" onClick={() => open("auth")} className="hover:text-background">
              Sign in
            </button>
          </nav>
        </div>
      </div>

      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-4 md:h-16 md:gap-6 md:px-10">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger aria-label="Open menu" className="-ml-2 grid size-11 place-items-center md:hidden">
              <Menu className="size-6" strokeWidth={1.5} />
            </SheetTrigger>
            {/* Close the drawer when any link or action inside it is used */}
            <SheetContent
              side="left"
              className="w-full max-w-sm gap-0 p-0"
              onClick={(e) => (e.target as HTMLElement).closest("a, button:not([data-slot=sheet-close])") && setMenuOpen(false)}
            >
              <SheetTitle className="border-b p-5 font-heading text-xl font-bold tracking-[0.08em] uppercase">Fieldwear</SheetTitle>
              <div className="grid grid-cols-3 border-b">
                {GENDERS.map((g) => (
                  <Link key={g} href={`/${g}/all`} className="py-3.5 text-center font-heading font-semibold tracking-wide uppercase hover:bg-mist">
                    {g}
                  </Link>
                ))}
              </div>
              <ul className="flex-1 overflow-y-auto">
                {CATEGORIES.map((c) => (
                  <li key={c}>
                    <Link href={`/women/${c.toLowerCase()}`} className="flex items-center justify-between px-5 py-4 text-[15px] hover:bg-mist">
                      {c} <ChevronRight className="size-5 text-muted-foreground" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2 border-t p-5">
                <Button onClick={() => open("auth")} className="h-11 font-semibold">
                  Sign in
                </Button>
                <Button variant="outline" onClick={() => open("auth")} className="h-11 border-foreground font-semibold">
                  Join
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Logo />

          <nav aria-label="Main" className="hidden h-full flex-1 md:flex">
            {NAV.map((item) => {
              const isGender = GENDERS.includes(item.toLowerCase() as Gender)
              return (
                <div key={item} className="group h-full">
                  <Link
                    href={hrefFor(item)}
                    className={cn(
                      "relative flex h-full items-center px-3 font-heading text-[15px] font-semibold tracking-[0.04em] uppercase",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[240ms] group-hover:after:scale-x-100",
                      item === "Sale" && "text-signal",
                    )}
                  >
                    {item}
                  </Link>
                  {isGender && <MegaMenu gender={item.toLowerCase()} />}
                </div>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => open("search")}
              className="mr-2 hidden h-10 w-56 items-center justify-between bg-mist px-3 text-sm text-muted-foreground transition-colors hover:bg-line/60 lg:flex"
            >
              Search <kbd className="border bg-background px-1.5 text-[11px]">/</kbd>
            </button>
            <IconButton label="Search" onClick={() => open("search")} className="lg:hidden">
              <Search />
            </IconButton>
            <AccountMenu />
            <IconButton label="Wishlist" count={wishlist.length} onClick={() => open("wishlist")}>
              <Heart />
            </IconButton>
            <IconButton label="Bag" count={count} onClick={() => open("bag")}>
              <ShoppingBag />
            </IconButton>
          </div>
        </div>

        <nav aria-label="Categories" className="flex h-11 gap-6 overflow-x-auto border-t px-4 [scrollbar-width:none] md:hidden">
          {["Women", "Men", "Kids", "Sports", "Lifestyle", "Sale"].map((item) => (
            <Link
              key={item}
              href={hrefFor(item)}
              className={cn("flex shrink-0 items-center font-heading text-[15px] font-semibold tracking-[0.04em] uppercase", item === "Sale" && "text-signal")}
            >
              {item}
            </Link>
          ))}
        </nav>
      </motion.header>
    </>
  )
}
