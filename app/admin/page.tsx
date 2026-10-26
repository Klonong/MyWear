import { redirect } from "next/navigation"

// ponytail: the back office is one page so far; give /admin its own dashboard when there's more than "new product"
export default function AdminPage() {
  redirect("/admin/products/new")
}
