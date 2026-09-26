"use client"

import { AuthDialog } from "@/components/store/auth-dialog"
import { BagSheet } from "@/components/store/bag-sheet"
import { QuickViewDialog } from "@/components/store/quick-view-dialog"
import { SearchDialog } from "@/components/store/search-dialog"
import { WishlistSheet } from "@/components/store/wishlist-sheet"

/** Every app-wide popup, mounted once. Open them from anywhere with useStore().open(...) / openQuickView(slug). */
export function GlobalOverlays() {
  return (
    <>
      <BagSheet />
      <WishlistSheet />
      <SearchDialog />
      <AuthDialog />
      <QuickViewDialog />
    </>
  )
}
