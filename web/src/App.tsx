import { Target } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApi } from '@/lib/api'
import type { Stats } from '@/lib/api'
import { usd, cn } from '@/lib/utils'
import { PicksView } from '@/views/PicksView'
import { AnalyticsView } from '@/views/AnalyticsView'
// Slate + Execution views archived (kept on disk, removed from nav) — focus is Picks + Analytics.

export default function App() {
  const { data: stats } = useApi<Stats>('/api/stats')
  return (
    <Tabs defaultValue="picks" className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <div className="flex items-center gap-2 font-extrabold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Target className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Edge Machine</span>
          </div>
          <TabsList className="ml-1 sm:ml-3">
            <TabsTrigger value="picks">Picks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          {stats && (
            <div className="ml-auto flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 shadow-card">
              <span className="hidden text-xs text-muted-foreground sm:inline">Bankroll</span>
              <span className="tnum font-bold">{usd(stats.balance)}</span>
              <span className={cn('tnum text-xs font-semibold', stats.growth_pct >= 0 ? 'text-yes' : 'text-no')}>
                {stats.growth_pct >= 0 ? '+' : ''}
                {stats.growth_pct}%
              </span>
            </div>
          )}
        </div>
      </header>
      <main className="container py-6">
        <TabsContent value="picks"><PicksView /></TabsContent>
        <TabsContent value="analytics"><AnalyticsView /></TabsContent>
      </main>
    </Tabs>
  )
}
