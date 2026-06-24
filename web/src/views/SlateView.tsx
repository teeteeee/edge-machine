import { useState } from 'react'
import { Star, FlaskConical } from 'lucide-react'
import { useApi, postJSON } from '@/lib/api'
import type { SlateGame } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionTitle, Empty } from '@/components/bits'

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
const fmtDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })

export function SlateView() {
  const [key, setKey] = useState(0)
  const { data } = useApi<SlateGame[]>('/api/slate', key)
  const list = data ?? []
  const checked = list.filter((g) => g.checked)

  const toggle = async (g: SlateGame) => {
    await postJSON(`/api/slate/${g.id}`, { checked: !g.checked })
    setKey((k) => k + 1)
  }
  const research = async () => {
    if (!checked.length) return
    const note =
      'Research these slate games and make picks:\n' + checked.map((g) => '• ' + (g.match || g.event_ticker)).join('\n')
    await postJSON('/api/request', { action: 'research_slate', note })
    alert(`🔬 Research queued for ${checked.length} game(s). Claude picks it up in a session.`)
  }

  const byDate: Record<string, SlateGame[]> = {}
  list.forEach((g) => {
    ;(byDate[g.date] ||= []).push(g)
  })

  return (
    <div>
      <SectionTitle hint={<span><b className="text-foreground">{checked.length}</b> selected · ★ = recommended</span>}>
        Game slate
      </SectionTitle>

      {list.length === 0 ? (
        <Empty>No slate yet. Ask Claude to list the next day’s games.</Empty>
      ) : (
        <div className="space-y-5">
          {Object.keys(byDate)
            .sort()
            .map((d) => (
              <div key={d}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fmtDate(d)}</div>
                <Card className="divide-y overflow-hidden">
                  {byDate[d].map((g) => (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
                    >
                      <Checkbox checked={!!g.checked} onCheckedChange={() => toggle(g)} />
                      <Star
                        className={g.starred ? 'h-4 w-4 fill-warn text-warn' : 'h-4 w-4 text-muted-foreground/30'}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold">{g.match || g.event_ticker}</span>
                          {g.sport !== 'soccer' && (
                            <Badge variant="outline" className="uppercase">{g.sport}</Badge>
                          )}
                          {!!g.researched && <Badge variant="yes">researched</Badge>}
                        </div>
                        {g.note && <div className="truncate text-xs text-muted-foreground">{g.note}</div>}
                      </div>
                      <span className="tnum shrink-0 text-sm text-muted-foreground">{fmtTime(g.kickoff)}</span>
                    </label>
                  ))}
                </Card>
              </div>
            ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={research} disabled={!checked.length}>
          <FlaskConical /> Research now
        </Button>
        <span className="text-sm text-muted-foreground">
          {checked.length ? `Queues a research request for ${checked.length} game(s)` : 'Tick games above, then queue'}
        </span>
      </div>
    </div>
  )
}
