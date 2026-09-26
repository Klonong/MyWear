"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@/components/ui/radio-group"

/** Full-width radio card. Use inside <ChoiceGroup>. */
export function ChoiceCard({
  value,
  title,
  detail,
  aside,
}: {
  value: string
  title: string
  detail?: string
  aside?: React.ReactNode
}) {
  return (
    <Radio.Root
      value={value}
      className="flex w-full items-center gap-4 border p-4 text-left transition-colors duration-[120ms] outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 data-checked:border-foreground data-checked:shadow-[inset_0_0_0_1px_var(--ink)]"
    >
      <span className="grid size-5 shrink-0 place-items-center rounded-full border border-foreground">
        <Radio.Indicator className="size-2.5 rounded-full bg-foreground data-starting-style:scale-0 transition-transform" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
      </span>
      {aside && <span className="tabular text-sm font-medium">{aside}</span>}
    </Radio.Root>
  )
}

export function ChoiceGroup({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <RadioGroup aria-label={label} value={value} onValueChange={(v) => onChange(v as string)} className={className ?? "gap-2"}>
      {children}
    </RadioGroup>
  )
}
