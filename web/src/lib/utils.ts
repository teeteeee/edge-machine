import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const usd = (v: number, sign = false) =>
  (v < 0 ? '−$' : sign ? '+$' : '$') + Math.abs(v ?? 0).toFixed(2).replace(/\.00$/, '')
