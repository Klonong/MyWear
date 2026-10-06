import type { Metadata } from "next"
import { AdminGate } from "./admin-gate"

export const metadata: Metadata = { title: "Admin | MyWear", robots: { index: false } }

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminGate>{children}</AdminGate>
}
