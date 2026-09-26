import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SectionHeader({
  title,
  href,
  linkLabel = "View all",
  children,
  className,
}: {
  title: string
  href?: string
  linkLabel?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <h2 className="font-heading text-[1.75rem] leading-none font-bold md:text-[2rem]">{title}</h2>
      <div className="flex items-center gap-4">
        {href && (
          <Link href={href} className="group flex items-center gap-1 text-sm font-medium">
            {linkLabel}
            <ArrowRight className="size-4 transition-transform duration-[240ms] group-hover:translate-x-0.5" />
          </Link>
        )}
        {children}
      </div>
    </div>
  )
}
