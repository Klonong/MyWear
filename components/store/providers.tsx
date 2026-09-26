"use client"

import { MotionConfig } from "motion/react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GlobalOverlays } from "@/components/store/global-overlays"
import { CookieBanner } from "@/components/store/cookie-banner"
import { StoreProvider } from "@/lib/store"

export const EASE = [0.2, 0, 0, 1] as const

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: EASE }}>
      <StoreProvider>
        <TooltipProvider delay={300}>
          {children}
          <GlobalOverlays />
          <CookieBanner />
          <Toaster
            theme="light"
            position="bottom-center"
            duration={4000}
            toastOptions={{
              classNames: {
                toast: "!rounded-none !border-0 !bg-foreground !text-background !shadow-[0_8px_30px_rgba(17,17,17,.18)]",
                description: "!text-background/70",
                actionButton: "!rounded-none !bg-background !font-semibold !text-foreground",
              },
            }}
          />
        </TooltipProvider>
      </StoreProvider>
    </MotionConfig>
  )
}
