import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Label above, input, helper or error below (design.md §3.9). */
export function FormField({
  name,
  label,
  error,
  hint,
  className,
  inputClassName,
  ...props
}: React.ComponentProps<"input"> & { name: string; label: string; error?: string; hint?: string; inputClassName?: string }) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={name} className="text-[13px] font-medium">
        {label} {props.required && <span className="font-normal text-muted-foreground">(required)</span>}
      </label>
      <Input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          "h-12 bg-background px-3 text-[15px] transition-colors hover:border-foreground/40 focus-visible:border-2 focus-visible:border-foreground focus-visible:ring-0 aria-invalid:border-signal aria-invalid:ring-0",
          inputClassName,
        )}
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} role="alert" className="flex items-center gap-1 text-xs text-signal">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const MESSAGES: Record<string, string> = {
  email: "Enter an email like name@example.com",
  phone: "Enter a phone number, e.g. 0812 3456 7890",
  postcode: "Enter a valid postcode, e.g. 12190",
  password: "Use at least 8 characters",
  slug: "Use lowercase words joined by hyphens",
}

/** Reads native constraint validation into { name: message }. Inputs can set data-label for the "Enter your …" copy. */
export function validateForm(form: HTMLFormElement) {
  const errors: Record<string, string> = {}
  for (const el of Array.from(form.elements) as HTMLInputElement[]) {
    if (!el.name || el.validity?.valid !== false) continue
    errors[el.name] = el.validity.valueMissing ? `Enter your ${el.dataset.label ?? el.name}` : (MESSAGES[el.name] ?? "Check this field")
  }
  if (Object.keys(errors).length) form.querySelector<HTMLElement>(":invalid")?.focus()
  return errors
}
