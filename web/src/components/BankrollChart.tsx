import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/lib/api'
import type { Prediction, Stats } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usd } from '@/lib/utils'

const GREEN = 'hsl(152,58%,34%)'
const RED = 'hsl(0,70%,50%)'

function ChartTip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { label: string; balance: number } }>
}) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-pop">
      <div className="tnum font-semibold">{usd(p.balance)}</div>
      <div className="text-muted-foreground">{p.label}</div>
    </div>
  )
}

export function BankrollChart() {
  const { data: preds } = useApi<Prediction[]>('/api/predictions')
  const { data: stats } = useApi<Stats>('/api/stats')
  const start = stats?.bankroll_start ?? 1000

  const rows = (preds ?? [])
    .filter((p) => p.status !== 'pending')
    .slice()
    .sort((a, b) => String(a.settled_at || '').localeCompare(String(b.settled_at || '')) || a.id - b.id)

  let bal = start
  const data = [{ i: 0, label: 'Start', balance: start }]
  rows.forEach((r, idx) => {
    bal += r.profit || 0
    data.push({ i: idx + 1, label: r.pick, balance: Math.round(bal * 100) / 100 })
  })
  const up = bal >= start
  const color = up ? GREEN : RED

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm">Bankroll</CardTitle>
        <div className="text-sm">
          <span className="tnum font-bold">{usd(bal)}</span>{' '}
          <span className={up ? 'text-yes' : 'text-no'}>{usd(bal - start, true)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis
                domain={['auto', 'auto']}
                width={56}
                tickFormatter={(v) => usd(Number(v))}
                tick={{ fontSize: 11, fill: 'hsl(215,16%,47%)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="balance" stroke={color} strokeWidth={2} fill="url(#bk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
