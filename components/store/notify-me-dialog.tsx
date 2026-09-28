"use client"

import { useState } from "react"
import { BellRing } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField, validateForm } from "@/components/store/form-field"
import { api, messageOf } from "@/lib/api"
import { useStore } from "@/lib/store"

/** Back-in-stock alert (PDP-10). Controlled: open it by passing the sold-out size. */
export function NotifyMeDialog({
  slug,
  productName,
  color,
  size,
  onClose,
}: {
  slug: string
  productName: string
  color: string
  size: string | null
  onClose: () => void
}) {
  const { user } = useStore()
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  // Keep showing the last size while the popup animates closed
  const [shown, setShown] = useState(size)
  if (size && size !== shown) setShown(size)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validateForm(e.currentTarget)
    setError(errs.email)
    if (errs.email) return
    const email = String(new FormData(e.currentTarget).get("email"))
    setBusy(true)
    try {
      await api("/stock-alerts", { method: "POST", body: { slug, color, size: shown, email } })
      onClose()
      toast("We'll let you know", { description: `Email alert set for ${productName} in ${color}, ${shown}.` })
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!size} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-5 p-6 sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center bg-mist">
            <BellRing className="size-6" strokeWidth={1.5} />
          </div>
          <DialogTitle className="font-heading text-2xl font-bold">{shown} is sold out</DialogTitle>
          <DialogDescription>Leave your email and we&apos;ll tell you as soon as it&apos;s back.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="space-y-4">
          <FormField name="email" type="email" label="Email" required data-label="email" autoComplete="email" defaultValue={user?.email} error={error} />
          <Button type="submit" disabled={busy} className="h-12 w-full font-heading text-base font-semibold">
            {busy ? "Saving..." : "Notify me"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
