"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormField, validateForm } from "@/components/store/form-field"
import { useStore } from "@/lib/store"

function AuthForm({ mode, onDone }: { mode: "sign-in" | "join"; onDone: () => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validateForm(e.currentTarget)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    // ponytail: no auth backend yet (ACC-1); simulate the round trip
    await new Promise((r) => setTimeout(r, 700))
    setBusy(false)
    onDone()
    toast(mode === "join" ? "Welcome to Fieldwear" : "Signed in", { description: "Your bag and wishlist are saved to your account." })
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      {mode === "join" && <FormField name="name" label="Full name" required data-label="name" autoComplete="name" error={errors.name} />}
      <FormField name="email" type="email" label="Email" required data-label="email" autoComplete="email" error={errors.email} />
      <FormField
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        data-label="password"
        autoComplete={mode === "join" ? "new-password" : "current-password"}
        hint={mode === "join" ? "At least 8 characters" : undefined}
        error={errors.password}
      />
      {mode === "sign-in" && (
        <button type="button" className="text-sm underline underline-offset-4 hover:no-underline">
          Forgot password?
        </button>
      )}
      <Button type="submit" disabled={busy} className="h-12 w-full font-heading text-base font-semibold">
        {busy ? "One moment..." : mode === "join" ? "Create account" : "Sign in"}
      </Button>
    </form>
  )
}

export function AuthDialog() {
  const { overlay, open } = useStore()
  const close = () => open(null)

  return (
    <Dialog open={overlay === "auth"} onOpenChange={(o) => !o && close()}>
      <DialogContent className="gap-6 p-6 sm:max-w-md sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl font-bold">Your account</DialogTitle>
          <DialogDescription>Track orders, save addresses and check out faster.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="sign-in">
          <TabsList variant="line" className="mb-5 h-10 w-full justify-start gap-6 border-b p-0">
            <TabsTrigger value="sign-in" className="flex-none px-0 font-heading text-lg font-semibold">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="join" className="flex-none px-0 font-heading text-lg font-semibold">
              Join
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <AuthForm mode="sign-in" onDone={close} />
          </TabsContent>
          <TabsContent value="join">
            <AuthForm mode="join" onDone={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
