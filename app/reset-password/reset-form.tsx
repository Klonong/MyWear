"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormField, validateForm } from "@/components/store/form-field"
import { api, messageOf } from "@/lib/api"
import { useStore } from "@/lib/store"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const { open } = useStore()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  if (!token) return <p className="mt-8 text-sm text-signal">This link is incomplete. Open the link from your email again, or request a new one from Sign in.</p>

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const errs = validateForm(e.currentTarget)
    if (!errs.confirm && form.get("password") !== form.get("confirm")) errs.confirm = "The passwords don't match"
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await api("/auth/reset-password", { method: "POST", body: { token, password: form.get("password") } })
      toast("Password changed", { description: "Sign in with your new password." })
      router.push("/")
      open("auth")
    } catch (err) {
      setErrors({ password: messageOf(err) })
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className="mt-8 space-y-4">
      <FormField name="password" type="password" label="New password" required minLength={8} data-label="password" autoComplete="new-password" hint="At least 8 characters" error={errors.password} />
      <FormField name="confirm" type="password" label="Repeat new password" required data-label="password again" autoComplete="new-password" error={errors.confirm} />
      <Button type="submit" disabled={busy} className="h-12 w-full font-heading text-base font-semibold">
        {busy ? "Saving..." : "Save new password"}
      </Button>
    </form>
  )
}
