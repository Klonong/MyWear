import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`
