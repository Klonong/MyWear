import Image from "next/image"
import { cn } from "@/lib/utils"
import type { Color } from "@/lib/data"

// ponytail: colours without a real cutout get a drawn garment placeholder; replace with 4:5 photography (design.md §2.7)
export function ProductImage({
  color,
  view = 0,
  className,
  alt,
}: {
  color: Color
  view?: number
  className?: string
  alt: string
}) {
  const flip = view % 2 === 1
  return (
    <div role="img" aria-label={alt} className={cn("relative aspect-[4/5] w-full overflow-hidden bg-studio", className)}>
      {color.image ? (
        <Image
          src={color.image}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className={cn("object-contain p-[14%]", flip && "-scale-x-100", view === 2 && "scale-125")}
        />
      ) : (
        <svg viewBox="0 0 100 125" className="absolute inset-0 size-full" aria-hidden>
          <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
            <path
              d="M36 22 L26 26 L10 44 L18 54 L28 46 L28 104 L72 104 L72 46 L82 54 L90 44 L74 26 L64 22 Q50 32 36 22 Z"
              fill={color.hex}
            />
            <path d="M36 22 Q50 32 64 22" fill="none" stroke={color.tone} strokeWidth="1.5" />
            {view === 2 && <rect x="40" y="56" width="20" height="14" fill={color.tone} opacity=".6" />}
          </g>
        </svg>
      )}
    </div>
  )
}
