import type { Gender, Product } from "@/lib/data"

/**
 * Talks to the MyWear API (../mywear-api). In the browser requests go to /api on this origin and next.config.ts
 * proxies them, so the API's cart and refresh cookies are first-party. On the server we call the API directly.
 */
const BASE = typeof window === "undefined" ? `${process.env.API_URL ?? "http://localhost:4000"}/api` : "/api"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/** The API's own message ("Only 2 left in A/L.") for toasts and inline errors */
export const messageOf = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.")

// Access token lives in memory only; the httpOnly refresh cookie restores it after a reload
let accessToken: string | null = null
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export type User = { id: string; email: string; name: string; phone: string | null; role: string }

let refreshing: Promise<User | null> | null = null
/** Trades the refresh cookie for a new access token. Concurrent callers share one request. */
export function refreshSession() {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (res) => {
      if (!res.ok) {
        accessToken = null
        return null
      }
      const body = (await res.json()) as { accessToken: string; user: User }
      accessToken = body.accessToken
      return body.user
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

type Options = { method?: string; body?: unknown; revalidate?: number; retry?: boolean }

export async function api<T>(path: string, { method = "GET", body, revalidate, retry = true }: Options = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" as const }),
    })
  } catch {
    throw new ApiError(0, "We can't reach the store right now. Check your connection and try again.")
  }
  // Expired access token: refresh once and replay
  if (res.status === 401 && accessToken && retry && (await refreshSession())) return api<T>(path, { method, body, retry: false })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string | string[] }
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    throw new ApiError(res.status, message ?? "Something went wrong. Please try again.")
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

/** Shape of GET /products */
export type ProductList = {
  items: Product[]
  total: number
  page: number
  limit: number
  facets: Record<string, { value: string; count: number }[]>
}

export type ProductDetail = Product & { completeTheLook: Product[]; youMayAlsoLike: Product[] }

export type Order = {
  number: string
  status: string
  createdAt: string
  email: string
  deliveryMethod: "standard" | "express"
  paymentMethod: "card" | "ewallet" | "va"
  subtotal: number
  discount: number
  shipping: number
  total: number
  promoCode: string | null
  address: { recipient: string; line1: string; line2: string | null; city: string; postcode: string }
  items: { id: string; slug: string; name: string; color: string; size: string; unitPrice: number; qty: number; lineTotal: number }[]
}

/** POST /checkout. `confirmUrl` only exists in development (mock gateway). */
export type CheckoutResult = { order: Order; payment: { provider: string; status: string; amount: number; expiresAt: string; confirmUrl?: string } }

export type Review = { id: string; rating: number; fit: string; title: string; body: string; author: string; createdAt: string }
export type ReviewList = { summary: { average: number; count: number; fit: Record<string, number> }; items: Review[]; total: number }

// Catalogue reads are cached for a minute on the server (ISR), so admin edits show up quickly

export const getProducts = (query: Record<string, string | number | undefined> = {}) => {
  const qs = new URLSearchParams(Object.entries(query).flatMap(([k, v]) => (v === undefined || v === "" ? [] : [[k, String(v)]])))
  return api<ProductList>(`/products?${qs}`, { revalidate: 60 })
}

/** Null when the product doesn't exist (or isn't published). */
export const getProduct = (slug: string) =>
  api<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { revalidate: 60 }).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  })

export const getReviews = (slug: string) => api<ReviewList>(`/products/${encodeURIComponent(slug)}/reviews`, { revalidate: 60 })

export type { Gender }
