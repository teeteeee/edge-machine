import { TrendingUp, TriangleAlert } from 'lucide-react'
import { useApi } from '@/lib/api'
import type { Analysis, Insight, TagStat, CornerBet } from '@/lib/api'
import { usd } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionTitle, Empty } from '@/components/bits'
import { BankrollChart } from '@/components/BankrollChart'
import { FlowDiagram } from '@/components/FlowDiagram'
import { ARCHETYPES, ARCHE_TONE } from '@/lib/archetypes'

function Breakdown({ title, data }: { title: string; data: Record<string, TagStat> }) {
  const rows = Object.entries(data).sort((a, b) => b[1].pnl - a[1].pnl)
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="divide-y">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 py-2 text-sm">
              <span className="flex-1 font-medium capitalize">{k}</span>
              <span className="tnum w-14 text-right text-muted-foreground">{v.w}–{v.l}</span>
              <span className={`tnum w-16 text-right font-semibold ${v.roi >= 0 ? 'text-yes' : 'text-no'}`}>
                {v.roi >= 0 ? '+' : ''}{v.roi}%
              </span>
              <span className={`tnum w-16 text-right ${v.pnl >= 0 ? 'text-yes' : 'text-no'}`}>{usd(v.pnl, true)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Curated playbook — the durable lessons, distilled from the learning log.
type Lesson = { name: string; rule: string; tag: string }
const EDGES: Lesson[] = [
  { name: 'Road warriors', rule: 'Back the AWAY handicap in genuinely EVEN games — the historical edge. But it’s a FRIENDLIES signal: in WC group games the favorites are covering, so reserve it for true coin-flips, not mismatches.', tag: '14–6 · +15%' },
  { name: 'Name the edge', rule: "If you can say in one sentence why the line is wrong, bet it. The “value” tag carries the entire P&L.", tag: '15–2 · +68%' },
  { name: 'Spread, not totals', rule: 'The match-result handicap is where the money lives; game totals are the weakest market.', tag: '22–5 · +37%' },
  { name: 'Chalk that holds', rule: 'Favorites priced under 1.60 simply win — no hero fades.', tag: '6–0' },
  { name: 'The Siege (corners)', rule: "A favorite’s CORNER total beats its goal total — corners track territory (shots r=.73), not goals (r=.02), so they dodge finishing variance. Spain: 0 goals, 11 corners.", tag: 'new edge' },
  { name: 'Fade fat corner totals', rule: "Corner totals cluster at ~9: over 8.5 hits 62%, but over 9.5 only 31%. Lay inflated corner overs (10+) unless it’s a true siege mismatch.", tag: 'o9.5 = 31%' },
]
const TRAPS: Lesson[] = [
  { name: 'Coin-flip leans', rule: 'A 50/50 dressed up as a pick. Posting every toss-up bleeds money — size tiny or skip.', tag: '2–3 · −33%' },
  { name: 'The run-it-up trap', rule: 'Never bet the Under on elite-vs-minnow. The big dog gets buried — Germany 7-1 crushed an Under 3.5.', tag: 'Germany 7-1' },
  { name: 'Goal-shy mirage', rule: '“They won’t score” is not conviction — one goal flips it. Sweden, the weak attack, scored anyway (3-1).', tag: 'fragile' },
  { name: 'Phantom striker', rule: 'A team total dies if the key man sits. Spain o2.5 staged early → Yamal benched → 0-0.', tag: 'confirm the XI' },
  { name: 'Siege that breaks', rule: "Corner-overs die when the game opens up — a dog that chases OR a favorite that romps 3-4. Jun 16: all 3 sieges under-delivered as the favorites scored freely.", tag: 'corner trap' },
  { name: 'Thin cushion, big favorite', rule: 'A +1.5 dog against a clear −1.5 favorite gets run over — every favorite covered Jun 16 (0-3). Match the cushion to the gap: +2.25 in a mismatch, +1.5 only in even games.', tag: '0-3' },
  { name: 'Dog-cushion in the WC', rule: 'WC group favorites cover the spread — dog +0.5/+1.5 plays went 0-5 over Jun 16-17 while the favorite plays (Argentina TT, Colombia −1.5) won. Back the favorite, not the dog’s cushion.', tag: '0-5' },
  { name: 'Injury-narrative fade', rule: 'The market already prices known absences. Ghana missing its two best mids still won 1-0 → Panama +0.5 lost. Don’t fade a favorite just because it’s depleted.', tag: '−$75' },
  { name: 'Vibes fade', rule: 'Recent-form narratives are already priced in. Fading USA on a “scoring drought” → Paraguay +0.5 lost 4-1.', tag: '−$75' },
]

function PlaybookCard({ kind, items }: { kind: 'edge' | 'trap'; items: Lesson[] }) {
  const edge = kind === 'edge'
  const accent = edge ? 'text-yes' : 'text-no'
  const border = edge ? 'border-l-yes/60' : 'border-l-no/60'
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {edge ? <TrendingUp className={`h-4 w-4 ${accent}`} /> : <TriangleAlert className={`h-4 w-4 ${accent}`} />}
          {edge ? 'Edges' : 'Traps'}
          <span className="font-normal text-muted-foreground">— {edge ? 'what works' : 'what loses'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((l) => (
          <div key={l.name} className={`border-l-2 ${border} pl-3`}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold">{l.name}</span>
              <span className={`ml-auto shrink-0 tnum text-[11px] font-semibold ${accent}`}>{l.tag}</span>
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{l.rule}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const amerStr = (p: number) => (p > 0 ? `+${p}` : `${p}`)

function CornerEdge() {
  const { data } = useApi<CornerBet[]>('/api/corners')
  const rows = data ?? []
  const settled = rows.filter((r) => r.status === 'win' || r.status === 'loss')
  const w = settled.filter((r) => r.status === 'win').length
  const l = settled.filter((r) => r.status === 'loss').length
  const pnl = rows.reduce((s, r) => s + (r.pnl || 0), 0)
  const staked = settled.reduce((s, r) => s + (r.stake || 0), 0)
  const roi = staked ? (100 * pnl) / staked : 0
  return (
    <div>
      <SectionTitle hint="Sportzino Corner-1x2 · Gold Coins · paper">Corner edge — the test</SectionTitle>
      <Card>
        <CardContent className="pt-5">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Sportzino's directional corner market — the one our edge is built for. We log a Corner-1x2 play <span className="font-semibold text-foreground">only
            when our projected corner-winner is priced near-even or plus</span> (positive edge vs the line) — never chalk —
            and grade it against the actual corner count. If this clears over ~15–20 bets, the edge is real.
          </p>
          {rows.length === 0 ? (
            <Empty>No spots logged yet. I’ll add one whenever a game’s siege-side is underpriced on Sportzino.</Empty>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-4 text-sm">
                <span>Record <span className="tnum font-bold">{w}–{l}</span></span>
                <span>GC P&L <span className={`tnum font-bold ${pnl >= 0 ? 'text-yes' : 'text-no'}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}</span></span>
                <span>ROI <span className={`tnum font-bold ${roi >= 0 ? 'text-yes' : 'text-no'}`}>{roi >= 0 ? '+' : ''}{roi.toFixed(0)}%</span></span>
              </div>
              <div className="divide-y text-sm">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2">
                    <span className="w-40 truncate">{r.match}</span>
                    <span className="w-20 font-semibold">{r.side_name}</span>
                    <span className="tnum w-14 text-muted-foreground">{amerStr(r.price)}</span>
                    <span className={`tnum w-14 ${r.edge >= 0 ? 'text-yes' : 'text-no'}`}>{r.edge >= 0 ? '+' : ''}{(r.edge * 100).toFixed(0)}%</span>
                    <span className="w-16 text-right">
                      {r.status === 'pending' ? (
                        <Badge variant="warn">Pending</Badge>
                      ) : r.status === 'win' ? (
                        <Badge variant="yes">Win</Badge>
                      ) : r.status === 'push' ? (
                        <Badge variant="default">Push</Badge>
                      ) : (
                        <Badge variant="no">Loss</Badge>
                      )}
                    </span>
                    <span className="tnum w-14 text-right text-xs text-muted-foreground">
                      {r.hc != null ? `${r.hc}-${r.ac}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsView() {
  const { data: an } = useApi<Analysis>('/api/analysis')
  const { data: ins } = useApi<Insight[]>('/api/insights')

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle hint="how the Edge Machine works">Strategy flow</SectionTitle>
        <Card>
          <CardContent className="pt-5">
            <FlowDiagram />
          </CardContent>
        </Card>
      </div>

      <BankrollChart />

      <div>
        <SectionTitle hint={an ? `${an.settled_count} settled` : ''}>Performance breakdown</SectionTitle>
        {an ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Breakdown title="By tag" data={an.by_tag} />
            <Breakdown title="By market" data={an.by_market} />
            <Breakdown title="By selection" data={an.by_selection} />
          </div>
        ) : (
          <Empty>No analysis yet.</Empty>
        )}
      </div>

      <div>
        <SectionTitle hint="the playbook">What I’ve learned</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <PlaybookCard kind="edge" items={EDGES} />
          <PlaybookCard kind="trap" items={TRAPS} />
        </div>
      </div>

      <CornerEdge />

      <div>
        <SectionTitle hint="a reaction, not a label">Team archetypes</SectionTitle>
        <Card>
          <CardContent className="pt-5">
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              A role is the <span className="font-semibold text-foreground">reaction between two teams</span>, not a fixed
              trait. The same side changes role with the matchup — Senegal is{' '}
              <span className="text-sky-400">The Wall</span> vs France, but the{' '}
              <span className="text-yes">Siege Engine</span> vs a minnow. And it can flip mid-game: a{' '}
              <span className="text-slate-300">Bus Parker</span> that concedes is forced out and becomes a{' '}
              <span className="text-amber-400">Counter-Striker</span> — the siege breaks. The chips on each card are
              resolved from that pairing, and the little 🧑‍🔬 <span className="font-semibold text-foreground">chemist
              sits beside the high-yield side</span> (where the corners pile up). When the two valences are too close to
              call (ΔG≈0) he <span className="font-semibold text-foreground">stands stranded in the middle, stumped</span> —
              a coin-flip, don’t trust the corner read.
            </p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {Object.values(ARCHETYPES).map((a) => (
              <div key={a.key} className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${ARCHE_TONE[a.tone]}`}>
                  {a.emoji} {a.label}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">{a.expect}</span>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {ins && ins.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-muted-foreground hover:text-foreground">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span> Full learning log ({ins.length})
          </summary>
          <div className="mt-3 space-y-3">
            {ins.map((i) => (
              <Card key={i.id} className="p-4">
                <div className="mb-1 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleString()}</div>
                <div className="whitespace-pre-line text-sm leading-relaxed">{i.summary}</div>
              </Card>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
