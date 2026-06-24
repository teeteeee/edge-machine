import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function StatTile({
  label,
  value,
  tone = 'none',
  sub,
}: {
  label: string
  value: ReactNode
  tone?: 'pos' | 'neg' | 'none'
  sub?: string
}) {
  return (
    <Card className="p-4">
      <div
        className={cn(
          'tnum text-2xl font-extrabold tracking-tight',
          tone === 'pos' && 'text-yes',
          tone === 'neg' && 'text-no',
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  )
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-extrabold tracking-tight">{children}</h2>
      {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">{children}</div>
}
