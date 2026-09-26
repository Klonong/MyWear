import { cn } from "@/lib/utils"

export function EmptyState({
  icon,
  title,
  body,
  children,
  className,
}: {
  icon?: React.ReactNode
  title: string
  body?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto flex max-w-sm flex-col items-center py-16 text-center", className)}>
      {icon && <div className="mb-5 grid size-16 place-items-center bg-mist [&_svg]:size-7 [&_svg]:stroke-[1.5]">{icon}</div>}
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      {children && <div className="mt-6 flex w-full gap-3">{children}</div>}
    </div>
  )
}
