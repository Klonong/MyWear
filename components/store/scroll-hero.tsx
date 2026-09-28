"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

/*
 * Layered campaign hero. public/hero/campaign.webp was split into a filled background, the character and four
 * garment cutouts. Every layer is placed in the source image's pixel space (1672x940) and converted to % of the
 * stage, so the layers line up exactly at any viewport size.
 */
const W = 1672
const H = 940
const RATIO = W / H
const FEET = { x: 985, y: 872 } // dolly origin: the character's front foot
const CHARACTER = { x: 876, y: 122, w: 254, h: 755 }
const GARMENTS = [
  { slug: "soft-knit-crew-sweater", name: "Soft Knit Crew Sweater", src: "/hero/sweater.webp", x: 685, y: 167, w: 193, h: 203, delay: 0 },
  { slug: "light-down-puffer-jacket", name: "Light Down Puffer Jacket", src: "/hero/puffer.webp", x: 1114, y: 106, w: 159, h: 177, delay: 1.6 },
  { slug: "easy-care-oxford-shirt", name: "Easy Care Oxford Shirt", src: "/hero/shirt.webp", x: 1152, y: 280, w: 189, h: 210, delay: 3.1 },
  { slug: "wide-straight-trousers", name: "Wide Straight Trousers", src: "/hero/trousers.webp", x: 1349, y: 254, w: 150, h: 268, delay: 0.8 },
]

// The glass ring in the picture, as a tilted ellipse in image px. Garments travel along it as you scroll.
const RING = { cx: 1029, cy: 243, rx: 474, ry: 125, tilt: -0.185 }
// One full turn: every piece sweeps round behind him (and through a phone's narrow view) and settles back home
const ORBIT = Math.PI * 2
const ringPoint = (t: number) => {
  const [c, s] = [Math.cos(RING.tilt), Math.sin(RING.tilt)]
  const [x, y] = [RING.rx * Math.cos(t), RING.ry * Math.sin(t)]
  return { x: RING.cx + x * c - y * s, y: RING.cy + x * s + y * c }
}
const nearestAngle = (px: number, py: number) => {
  let best = 0
  let dist = Infinity
  for (let i = 0; i < 360; i++) {
    const t = (i / 360) * Math.PI * 2
    const p = ringPoint(t)
    const d = (p.x - px) ** 2 + (p.y - py) ** 2
    if (d < dist) [best, dist] = [t, d]
  }
  return best
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`
const box = (b: { x: number; y: number; w: number; h: number }) => ({ left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H) })

// object-cover for the stage, focused on the character (x 60%, y 53%)
const STAGE_W = `max(100cqw, 100cqh * ${RATIO})`
const STAGE_H = `max(100cqh, 100cqw / ${RATIO})`
const STAGE: React.CSSProperties = {
  width: STAGE_W,
  aspectRatio: `${W} / ${H}`,
  left: `clamp(100cqw - ${STAGE_W}, 50cqw - 0.6 * ${STAGE_W}, 0px)`,
  top: `clamp(100cqh - ${STAGE_H}, 50cqh - 0.53 * ${STAGE_H}, 0px)`,
}

function Garment({ g, progress }: { g: (typeof GARMENTS)[number]; progress: MotionValue<number> }) {
  const { openQuickView } = useStore()
  const t0 = nearestAngle(g.x + g.w / 2, g.y + g.h / 2)
  const start = ringPoint(t0)
  const at = (p: number) => ringPoint(t0 + p * ORBIT)

  // Translate % is relative to the garment's own box, so image px / box size keeps it resolution independent
  const x = useTransform(progress, (p) => `${((at(p).x - start.x) / g.w) * 100}%`)
  const y = useTransform(progress, (p) => `${((at(p).y - start.y) / g.h) * 100}%`)
  // The upper arc reads as nearer: pieces grow a little and tilt as they travel round
  const scale = useTransform(progress, (p) => 1 + 0.14 * (Math.sin(t0) - Math.sin(t0 + p * ORBIT)))
  const rotate = useTransform(progress, (p) => 7 * (Math.cos(t0 + p * ORBIT) - Math.cos(t0)))

  return (
    <motion.button
      type="button"
      onClick={() => openQuickView(g.slug)}
      aria-label={`Shop ${g.name}`}
      style={{ ...box(g), x, y, scale, rotate }}
      className="group absolute cursor-pointer outline-none"
    >
      <span className="relative block size-full motion-safe:animate-[hero-float_6s_ease-in-out_infinite]" style={{ animationDelay: `-${g.delay}s` }}>
        <Image
          src={g.src}
          alt=""
          fill
          loading="eager"
          sizes="(max-aspect-ratio: 16/9) 22vh, 12vw"
          className="object-contain drop-shadow-[0_18px_20px_rgba(40,70,120,.22)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
        />
      </span>
      <span className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 translate-y-1 bg-foreground px-2.5 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {g.name}
      </span>
    </motion.button>
  )
}

export function ScrollHero() {
  const section = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 })
  const still = useMotionValue(0)
  const progress = reduce ? still : smooth

  // Camera dolly: the character scales faster than the world behind him, which reads as depth
  const worldScale = useTransform(progress, [0, 1], [1, 1.07])
  const charScale = useTransform(progress, [0, 1], [1, 1.16])

  // Mouse parallax (desktop): nearer layers move further
  const mx = useSpring(0, { stiffness: 60, damping: 18 })
  const my = useSpring(0, { stiffness: 60, damping: 18 })
  const worldX = useTransform(mx, (v) => v * -10)
  const worldY = useTransform(my, (v) => v * -6)
  const charX = useTransform(mx, (v) => v * -22)
  const charY = useTransform(my, (v) => v * -10)

  const copyOpacity = useTransform(progress, [0, 0.35, 0.75], [1, 1, 0])
  const copyY = useTransform(progress, [0, 0.75], [0, -48])
  const hintOpacity = useTransform(progress, [0.7, 0.85], [0, 1])

  const origin = `${pct(FEET.x, W)} ${pct(FEET.y, H)}`

  return (
    <section ref={section} aria-label="New season campaign" className={cn("relative", reduce ? "h-[100dvh]" : "h-[220dvh]")}>
      <div
        className="sticky top-0 h-[100dvh] overflow-hidden bg-[#9dc3ee] [container-type:size]"
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return
          const r = e.currentTarget.getBoundingClientRect()
          mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
          my.set(((e.clientY - r.top) / r.height) * 2 - 1)
        }}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
      >
        <div className="absolute" style={STAGE}>
          {/* World: background + ring + garments move together */}
          <motion.div className="absolute inset-0" style={{ scale: worldScale, x: worldX, y: worldY, transformOrigin: origin }}>
            <Image src="/hero/background.webp" alt="" fill priority sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" className="object-cover" />
            {GARMENTS.map((g) => (
              <Garment key={g.slug} g={g} progress={progress} />
            ))}
          </motion.div>

          <motion.div
            className="pointer-events-none absolute"
            style={{
              ...box(CHARACTER),
              scale: charScale,
              x: charX,
              y: charY,
              transformOrigin: `${pct(FEET.x - CHARACTER.x, CHARACTER.w)} ${pct(FEET.y - CHARACTER.y, CHARACTER.h)}`,
            }}
          >
            <Image
              src="/hero/character.webp"
              alt="Model wearing a black overshirt, cream tee and wide black trousers"
              fill
              priority
              sizes="(max-aspect-ratio: 16/9) 28vh, 16vw"
              className="object-contain"
            />
          </motion.div>
        </div>

        {/* Soft floor fade so the hero hands over to the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-background from-35% via-background/75 to-transparent md:h-[18%] md:from-0%" />

        <motion.div
          style={{ opacity: copyOpacity, y: copyY }}
          className="absolute inset-x-4 bottom-32 md:inset-x-auto md:bottom-auto md:left-10 md:top-[42%] md:max-w-[27rem] md:-translate-y-1/2 lg:left-16"
        >
          <h1 className="font-heading text-[2.75rem] leading-[0.95] font-bold md:text-[3.75rem] lg:text-[4.5rem]">Four pieces. Every outfit.</h1>
          <p className="mt-4 max-w-[36ch] text-[15px] text-foreground/80 md:text-base">
            A soft knit, a light puffer, an oxford shirt and wide trousers that work together all season.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/men/all" className={cn(buttonVariants(), "group h-13 px-7 font-heading text-lg font-semibold active:scale-[0.98]")}>
              Shop men
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/men/all?badge=New"
              className={cn(buttonVariants({ variant: "outline" }), "h-13 border-foreground bg-background/70 px-7 font-heading text-lg font-semibold backdrop-blur-sm")}
            >
              New arrivals
            </Link>
          </div>
        </motion.div>

        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm font-medium md:bottom-10"
        >
          Tap any floating piece to shop it
        </motion.p>
      </div>
    </section>
  )
}
