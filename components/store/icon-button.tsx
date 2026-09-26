"use client"

import { AnimatePresence, motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, plural } from "@/lib/utils"

/** 44px icon button with a tooltip and an optional animated count badge. */
export function IconButton({
  label,
  count,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string; count?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={count ? `${label}, ${plural(count, "item")}` : label}
            className={cn(
              "relative grid size-11 place-items-center transition-transform duration-[120ms] active:scale-95 [&_svg]:size-6 [&_svg]:stroke-[1.5]",
              className,
            )}
            {...props}
          />
        }
      >
        {children}
        <AnimatePresence>
          {!!count && (
            <motion.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="tabular absolute top-1 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
