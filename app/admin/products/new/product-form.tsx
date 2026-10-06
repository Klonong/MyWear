"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useId, useState } from "react"
import { AlertCircle, ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormField, validateForm } from "@/components/store/form-field"
import { SuccessMark } from "@/components/store/success-mark"
import { api, ApiError, messageOf } from "@/lib/api"
import { GENDERS, type Gender } from "@/lib/data"
import { cn } from "@/lib/utils"

type Category = { id: string; gender: Gender; name: string; slug: string }
type ColorDraft = { key: number; name: string; hex: string; images: string[]; uploading: number; stock: Record<string, string> }

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif"
const SIZES: Record<Gender, string[]> = {
  women: ["A/XS", "A/S", "A/M", "A/L", "A/XL", "A/XXL", "One size"],
  men: ["A/XS", "A/S", "A/M", "A/L", "A/XL", "A/XXL", "One size"],
  kids: ["110", "120", "130", "140", "150", "160", "One size"],
}
const SPORTS = ["Lifestyle", "Running", "Training"]

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/** The storefront draws its placeholder garment with a darker "tone" of the swatch */
const darken = (hex: string) =>
  "#" +
  hex
    .slice(1)
    .match(/../g)!
    .map((h) => Math.round(parseInt(h, 16) * 0.7).toString(16).padStart(2, "0"))
    .join("")

const control =
  "w-full rounded-lg border border-input bg-background px-3 text-[15px] outline-none transition-colors hover:border-foreground/40 focus-visible:border-2 focus-visible:border-foreground aria-invalid:border-signal"

let nextKey = 0
const newColor = (): ColorDraft => ({ key: nextKey++, name: "", hex: "#1f1f1f", images: [], uploading: 0, stock: {} })

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

function Labeled({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        {label} {required && <span className="font-normal text-muted-foreground">(required)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-signal">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export function ProductForm() {
  const [formKey, setFormKey] = useState(0)
  const [created, setCreated] = useState<{ slug: string; name: string; status: string } | null>(null)

  if (created)
    return (
      <div className="mt-12 border-t border-line pt-12 text-center">
        <SuccessMark />
        <h2 className="mt-6 font-heading text-3xl font-bold">{created.name} is {created.status === "published" ? "live" : "saved as a draft"}</h2>
        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
          {created.status === "published" ? (
            <Link href={`/product/${created.slug}`} className={cn(buttonVariants({ variant: "outline" }), "h-12 border-foreground font-heading text-base font-semibold")}>
              View product
            </Link>
          ) : (
            <span />
          )}
          <Button
            onClick={() => {
              setCreated(null)
              setFormKey((k) => k + 1)
            }}
            className="h-12 font-heading text-base font-semibold"
          >
            Add another
          </Button>
        </div>
      </div>
    )

  return <Form key={formKey} onCreated={setCreated} />
}

function Form({ onCreated }: { onCreated: (p: { slug: string; name: string; status: string }) => void }) {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [gender, setGender] = useState<Gender>("women")
  const [category, setCategory] = useState("")
  const [colors, setColors] = useState<ColorDraft[]>(() => [newColor()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api<Category[]>("/admin/categories").then(setCategories, (e: unknown) => {
      setCategories([])
      toast.error(messageOf(e))
    })
  }, [])

  const options = categories?.filter((c) => c.gender === gender) ?? []
  const categorySlug = options.some((c) => c.slug === category) ? category : (options[0]?.slug ?? "")
  const uploading = colors.some((c) => c.uploading > 0)

  const patch = (key: number, fn: (c: ColorDraft) => ColorDraft) => setColors((cs) => cs.map((c) => (c.key === key ? fn(c) : c)))

  const upload = (key: number, files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error(`${file.name}: use a JPEG, PNG, WebP or AVIF image.`)
        continue
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 5 MB. Export it smaller and try again.`)
        continue
      }
      patch(key, (c) => ({ ...c, uploading: c.uploading + 1 }))
      const body = new FormData()
      body.append("file", file)
      api<{ url: string }>("/admin/uploads", { method: "POST", body })
        .then(({ url }) => patch(key, (c) => ({ ...c, images: [...c.images, url] })))
        .catch((e: unknown) => toast.error(`${file.name}: ${messageOf(e)}`))
        .finally(() => patch(key, (c) => ({ ...c, uploading: c.uploading - 1 })))
    }
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const errs = validateForm(form)
    const price = Number(data.get("price"))
    const sale = data.get("salePrice") ? Number(data.get("salePrice")) : undefined
    if (!errs.salePrice && sale !== undefined && sale >= price) errs.salePrice = "Sale price must be lower than the price"
    if (!categorySlug) errs.category = categories ? "Add a category for this gender first" : "Categories are still loading"
    const sizes = SIZES[gender]
    colors.forEach((c, i) => {
      if (!c.name.trim()) errs[`color-${c.key}`] = `Name colour ${i + 1}`
      else if (!sizes.some((s) => c.stock[s])) errs[`color-${c.key}`] = `Enter stock for at least one size of ${c.name}`
    })
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error("Check the highlighted fields")
      return
    }

    setBusy(true)
    const text = (k: string) => String(data.get(k) ?? "").trim()
    try {
      const product = await api<{ slug: string; name: string; status: string }>("/admin/products", {
        method: "POST",
        body: {
          slug,
          name: name.trim(),
          description: text("description"),
          gender,
          categorySlug,
          sport: text("sport"),
          material: text("material"),
          fit: text("fit"),
          badge: text("badge") || undefined,
          notice: text("notice") || undefined,
          status: text("status"),
          colors: colors.map((c) => ({
            name: c.name.trim(),
            hex: c.hex,
            tone: darken(c.hex),
            images: c.images.map((url, i) => ({ url, alt: `${name.trim()} in ${c.name.trim()}${i ? `, view ${i + 1}` : ""}` })),
            skus: sizes.filter((s) => c.stock[s]).map((s) => ({ size: s, price, salePrice: sale, stock: Number(c.stock[s]) })),
          })),
        },
      })
      onCreated(product)
      window.scrollTo({ top: 0 })
    } catch (err) {
      // A duplicate slug comes back as 409 from the API's unique-constraint filter
      if (err instanceof ApiError && err.status === 409) setErrors({ slug: "Another product already uses this URL. Change it." })
      toast.error(messageOf(err))
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className="mt-10 space-y-10">
      <Section title="Details">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            name="name"
            label="Product name"
            required
            minLength={2}
            maxLength={120}
            data-label="product name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugEdited) setSlug(slugify(e.target.value))
            }}
            error={errors.name}
          />
          <FormField
            name="slug"
            label="URL"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            data-label="URL"
            value={slug}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(e.target.value)
            }}
            hint={slug ? `/product/${slug}` : "Filled in from the name"}
            error={errors.slug}
          />
        </div>
        <Labeled id="description" label="Description" required error={errors.description} hint="Shown under the price on the product page">
          <textarea
            id="description"
            name="description"
            required
            minLength={2}
            maxLength={2000}
            rows={4}
            data-label="description"
            aria-invalid={!!errors.description}
            className={cn(control, "py-2.5")}
          />
        </Labeled>
        <div className="grid gap-5 md:grid-cols-3">
          <Labeled id="gender" label="Gender" required>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={cn(control, "h-12 capitalize")}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled id="category" label="Category" required error={errors.category}>
            <select
              id="category"
              value={categorySlug}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!categories}
              aria-invalid={!!errors.category}
              className={cn(control, "h-12")}
            >
              {!categories && <option>Loading…</option>}
              {options.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Labeled>
          <FormField name="sport" label="Sport" required minLength={2} maxLength={40} data-label="sport" list="sports" defaultValue="Lifestyle" error={errors.sport} />
          <datalist id="sports">
            {SPORTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField name="material" label="Material" required minLength={2} maxLength={300} data-label="material" placeholder="100% cotton" error={errors.material} />
          <FormField name="fit" label="Fit" required minLength={2} maxLength={200} data-label="fit" placeholder="Relaxed fit, dropped shoulders" error={errors.fit} />
        </div>
      </Section>

      <Section title="Price" hint="Applies to every size and colour. Adjust single SKUs later from inventory.">
        <div className="grid gap-5 md:grid-cols-3">
          <FormField name="price" label="Price (IDR)" type="number" inputMode="numeric" required min={0} data-label="price" error={errors.price} />
          <FormField name="salePrice" label="Sale price (IDR)" type="number" inputMode="numeric" min={0} hint="Leave empty if not on sale" error={errors.salePrice} />
          <Labeled id="badge" label="Badge">
            <select id="badge" name="badge" defaultValue="" className={cn(control, "h-12")}>
              <option value="">None</option>
              <option>New</option>
              <option>Sale</option>
              <option>Limited</option>
            </select>
          </Labeled>
        </div>
        <FormField name="notice" label="Notice" maxLength={120} placeholder="Excluded from vouchers & coupons" hint="A notice also excludes the product from promo codes" />
      </Section>

      <Section title="Colours & stock" hint="The first photo is the cover in listings. Leave stock empty for sizes you don't sell.">
        {colors.map((c, i) => (
          <ColorCard
            key={c.key}
            color={c}
            index={i}
            sizes={SIZES[gender]}
            error={errors[`color-${c.key}`]}
            onChange={(fn) => patch(c.key, fn)}
            onUpload={(files) => upload(c.key, files)}
            onRemove={colors.length > 1 ? () => setColors((cs) => cs.filter((x) => x.key !== c.key)) : undefined}
          />
        ))}
        <Button type="button" variant="outline" onClick={() => setColors((cs) => [...cs, newColor()])} className="h-12 w-full border-dashed border-foreground/40 font-semibold">
          <Plus /> Add colour
        </Button>
      </Section>

      <Section title="Publish">
        <fieldset className="grid gap-3 md:grid-cols-2">
          <legend className="sr-only">Visibility</legend>
          {[
            ["published", "Publish now", "Visible in the store straight away"],
            ["draft", "Save as draft", "Hidden until you publish it"],
          ].map(([value, title, body]) => (
            <label key={value} className="flex cursor-pointer gap-3 border border-line p-4 has-checked:border-2 has-checked:border-foreground">
              <input type="radio" name="status" value={value} defaultChecked={value === "published"} className="mt-1 accent-foreground" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">{body}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "h-13 px-4 text-[15px]")}>
            <ArrowLeft /> Back to store
          </Link>
          <Button type="submit" disabled={busy || uploading} className="h-13 px-10 font-heading text-base font-semibold">
            {busy ? (
              <>
                <Loader2 className="animate-spin" /> Saving…
              </>
            ) : uploading ? (
              "Waiting for photos…"
            ) : (
              "Save product"
            )}
          </Button>
        </div>
      </Section>
    </form>
  )
}

function ColorCard({
  color,
  index,
  sizes,
  error,
  onChange,
  onUpload,
  onRemove,
}: {
  color: ColorDraft
  index: number
  sizes: string[]
  error?: string
  onChange: (fn: (c: ColorDraft) => ColorDraft) => void
  onUpload: (files: FileList | File[]) => void
  onRemove?: () => void
}) {
  const id = useId()
  const [dragging, setDragging] = useState(false)

  return (
    <div role="group" aria-labelledby={`${id}-title`} className={cn("space-y-5 border border-line p-4 md:p-6", error && "border-signal")}>
      <div className="flex items-center justify-between gap-4">
        <h3 id={`${id}-title`} className="font-heading text-xl font-bold">
          {color.name.trim() || `Colour ${index + 1}`}
        </h3>
        {onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove ${color.name || `colour ${index + 1}`}`}>
            <Trash2 /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        <FormField
          name={`${id}-name`}
          label="Colour name"
          required
          maxLength={40}
          placeholder="Black"
          value={color.name}
          onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))}
        />
        <Labeled id={`${id}-hex`} label="Swatch">
          <input
            id={`${id}-hex`}
            type="color"
            value={color.hex}
            onChange={(e) => onChange((c) => ({ ...c, hex: e.target.value }))}
            className="block h-12 w-16 cursor-pointer rounded-lg border border-input bg-background p-1"
          />
        </Labeled>
      </div>

      <div>
        <p className="text-[13px] font-medium">Photos</p>
        <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {color.images.map((url, i) => (
            <li key={url} className="group relative aspect-[4/5] overflow-hidden bg-studio">
              <Image src={url} alt="" fill unoptimized className="object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 bg-foreground px-1.5 py-0.5 text-[11px] font-semibold text-background">Cover</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange((c) => ({ ...c, images: [url, ...c.images.filter((u) => u !== url)] }))}
                  className="absolute bottom-1.5 left-1.5 bg-background/90 px-1.5 py-0.5 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  Make cover
                </button>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => onChange((c) => ({ ...c, images: c.images.filter((u) => u !== url) }))}
                className="absolute top-1.5 right-1.5 grid size-7 place-items-center bg-background/90 transition-transform active:scale-90"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {Array.from({ length: color.uploading }, (_, i) => (
            <li key={`up-${i}`} className="grid aspect-[4/5] place-items-center bg-mist" aria-label="Uploading photo">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </li>
          ))}
          <li>
            <label
              htmlFor={`${id}-files`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                onUpload(e.dataTransfer.files)
              }}
              className={cn(
                "flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-foreground/30 p-2 text-center text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground has-focus-visible:border-2 has-focus-visible:border-foreground",
                dragging && "border-foreground bg-mist text-foreground",
              )}
            >
              <ImagePlus className="size-5" strokeWidth={1.5} />
              Add photos
              <input
                id={`${id}-files`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files) onUpload(e.target.files)
                  e.target.value = ""
                }}
              />
            </label>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF, up to 5 MB each. 4:5 portrait works best.</p>
      </div>

      <div>
        <p className="text-[13px] font-medium">Stock by size</p>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {sizes.map((s) => (
            <label key={s} className="space-y-1">
              <span className="block text-xs text-muted-foreground">{s.replace("A/", "")}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="–"
                value={color.stock[s] ?? ""}
                onChange={(e) => onChange((c) => ({ ...c, stock: { ...c.stock, [s]: e.target.value } }))}
                className={cn(control, "tabular h-11 px-2 text-center")}
              />
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-signal">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}
