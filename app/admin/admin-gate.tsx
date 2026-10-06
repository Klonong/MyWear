"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/store/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/lib/store"

export const CATALOG_ROLES = ["admin", "merchandiser"]

/** UX only: the API enforces roles on every /admin route. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, user, open } = useStore()
  if (!ready)
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  if (!user)
    return (
      <EmptyState icon={<Lock />} title="Sign in to continue" body="The admin area is for MyWear staff.">
        <Button onClick={() => open("auth")} className="h-12 flex-1 font-heading text-base font-semibold">
          Sign in
        </Button>
      </EmptyState>
    )
  if (!CATALOG_ROLES.includes(user.role))
    return <EmptyState icon={<Lock />} title="No access" body={`${user.email} can't manage the catalogue. Ask an admin to change your role.`} />
  return children
}
