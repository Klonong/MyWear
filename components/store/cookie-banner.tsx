"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"

const KEY = "fieldwear-consent"

/** CNT-5 consent banner. Remembers the choice in localStorage. */
export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- only known after mount
      setShow(!localStorage.getItem(KEY))
    } catch {}
  }, [])

  const choose = (value: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, value)
    } catch {}
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          initial={{ y: "110%" }}
          animate={{ y: 0, transition: { delay: 1, type: "spring", stiffness: 200, damping: 26 } }}
          exit={{ y: "110%" }}
          className="fixed inset-x-3 bottom-3 z-40 flex flex-col gap-4 bg-background p-5 shadow-[0_8px_40px_rgba(17,17,17,.16)] ring-1 ring-line sm:left-auto sm:max-w-sm"
        >
          <p className="text-sm">
            We use cookies to keep your bag, remember your size and improve the store. You can accept all or keep only essential ones.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => choose("essential")} className="h-11 border-foreground">
              Essential only
            </Button>
            <Button onClick={() => choose("all")} className="h-11 font-semibold">
              Accept all
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
