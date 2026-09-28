import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/store/empty-state"
import { SuccessMark } from "@/components/store/success-mark"
import { api, messageOf } from "@/lib/api"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Newsletter | MyWear" }

/** Landing page for the double opt-in link the API emails (CNT-3). */
export default async function Page({ searchParams }: PageProps<"/newsletter/confirm">) {
  const { token } = await searchParams
  const error =
    typeof token === "string" && token
      ? await api("/newsletter/confirm", { method: "POST", body: { token } }).then(
          () => null,
          (e: unknown) => messageOf(e),
        )
      : "This link is incomplete. Open the link from your email again."

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      {error ? (
        <EmptyState title="We couldn't confirm your email" body={error} />
      ) : (
        <>
          <SuccessMark />
          <h1 className="mt-6 font-heading text-[2.5rem] leading-none font-bold">You&apos;re subscribed</h1>
          <p className="mt-4 text-[15px] text-muted-foreground">New drops and member offers will land in your inbox first.</p>
        </>
      )}
      <Link href="/" className={cn(buttonVariants(), "mt-10 h-13 px-8 font-heading text-base font-semibold")}>
        Continue shopping
      </Link>
    </div>
  )
}
