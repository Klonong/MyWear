import type { Metadata } from "next"
import { ResetPasswordForm } from "./reset-form"

export const metadata: Metadata = { title: "Reset your password | MyWear" }

/** Landing page for the reset link the API emails (POST /auth/forgot-password). */
export default async function Page({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-heading text-[2.5rem] leading-none font-bold">Choose a new password</h1>
      <p className="mt-3 text-[15px] text-muted-foreground">For your security, you&apos;ll be signed out on your other devices.</p>
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </div>
  )
}
