"use client"

import { useState } from "react"
import { Ruler } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Body measurements in cm: [chest, waist, hip]
const CHART: Record<string, [string, number, number, number][]> = {
  Women: [
    ["XS", 76, 60, 84],
    ["S", 82, 66, 88],
    ["M", 88, 72, 94],
    ["L", 94, 78, 100],
    ["XL", 100, 84, 106],
  ],
  Men: [
    ["XS", 84, 70, 86],
    ["S", 90, 76, 92],
    ["M", 96, 82, 98],
    ["L", 102, 88, 104],
    ["XL", 108, 94, 110],
  ],
  Kids: [
    ["110", 56, 51, 60],
    ["120", 60, 53, 64],
    ["130", 64, 55, 69],
    ["140", 68, 58, 74],
    ["150", 74, 62, 80],
  ],
}

export function SizeGuideDialog({ defaultTab = "Women" }: { defaultTab?: string }) {
  const [inch, setInch] = useState(false)
  const fmt = (cm: number) => (inch ? (cm / 2.54).toFixed(1) : cm)

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 hover:no-underline">
        <Ruler className="size-4" strokeWidth={1.5} /> Size guide
      </DialogTrigger>
      <DialogContent className="gap-6 p-6 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">Size guide</DialogTitle>
          <DialogDescription>Body measurements. Between sizes? Choose the larger one for a relaxed fit.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab}>
          <div className="flex items-center justify-between gap-4">
            <TabsList variant="line" className="h-10 gap-4 p-0">
              {Object.keys(CHART).map((t) => (
                <TabsTrigger key={t} value={t} className="px-0 font-heading text-base font-semibold">
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
            <div role="group" aria-label="Units" className="flex border text-xs font-medium">
              {["cm", "in"].map((u) => (
                <button
                  key={u}
                  type="button"
                  aria-pressed={(u === "in") === inch}
                  onClick={() => setInch(u === "in")}
                  className={cn("h-8 w-10 transition-colors", (u === "in") === inch ? "bg-foreground text-background" : "hover:bg-mist")}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {Object.entries(CHART).map(([t, rows]) => (
            <TabsContent key={t} value={t} className="mt-4">
              <table className="tabular w-full text-sm">
                <thead>
                  <tr className="bg-mist text-left">
                    {["Size", "Chest", "Waist", "Hip"].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([size, ...m]) => (
                    <tr key={size} className="even:bg-mist/50">
                      <td className="px-3 py-2.5 font-medium">{t === "Kids" ? size : `A/${size}`}</td>
                      {m.map((v, i) => (
                        <td key={i} className="px-3 py-2.5 text-muted-foreground">
                          {fmt(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
