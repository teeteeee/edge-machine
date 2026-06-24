const TXT = 'hsl(var(--foreground))'
const SUB = 'hsl(var(--muted-foreground))'
const ARR = 'hsl(var(--muted-foreground))'

type Tone = 'box' | 'green' | 'amber' | 'coral'
const TONES: Record<Tone, { fill: string; stroke: string }> = {
  box: { fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--border))' },
  green: { fill: 'hsl(var(--yes-soft))', stroke: 'hsl(var(--yes))' },
  amber: { fill: 'hsl(38 45% 14%)', stroke: 'hsl(38 85% 55%)' },
  coral: { fill: 'hsl(0 45% 15%)', stroke: 'hsl(0 72% 60%)' },
}

function Node({ x, y, w, h, tone = 'box', title, sub, sub2 }: {
  x: number; y: number; w: number; h: number; tone?: Tone; title: string; sub?: string; sub2?: string
}) {
  const t = TONES[tone]
  const cx = x + w / 2
  const titleY = sub2 ? y + 22 : sub ? y + h / 2 - 2 : y + h / 2 + 4
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={t.fill} stroke={t.stroke} strokeWidth={1} />
      <text x={cx} y={titleY} textAnchor="middle" fontSize={13} fontWeight={500} fill={TXT}>{title}</text>
      {sub && <text x={cx} y={sub2 ? y + 40 : y + h / 2 + 15} textAnchor="middle" fontSize={11} fill={SUB}>{sub}</text>}
      {sub2 && <text x={cx} y={y + 56} textAnchor="middle" fontSize={11} fill={SUB}>{sub2}</text>}
    </g>
  )
}

function Arr({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ARR} strokeWidth={1.4} markerEnd="url(#fdArrow)" />
}

export function FlowDiagram() {
  return (
    <svg viewBox="0 0 680 628" width="100%" height="auto" role="img"
      style={{ fontFamily: 'inherit', maxWidth: 680, display: 'block', margin: '0 auto' }}>
      <title>Edge Machine pipeline, control gate and three-market variance ladder</title>
      <defs>
        <marker id="fdArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      <text x={4} y={18} fontSize={14} fontWeight={500} fill={TXT}>Pipeline — capture, learn, repeat</text>
      <Node x={4} y={30} w={116} h={60} title="Data sources" sub="ESPN · Sportzino" />
      <Node x={144} y={30} w={116} h={60} title="Settle + capture" sub="10 markets · stats" />
      <Node x={284} y={30} w={116} h={60} title="Base rates" sub="corners · possession" />
      <Node x={424} y={30} w={116} h={60} title="Storyline" sub="control · grind/romp" />
      <Node x={564} y={30} w={112} h={60} tone="green" title="Correlated pair" sub="2 legs → bet" />
      <Arr x1={121} y1={60} x2={143} y2={60} />
      <Arr x1={261} y1={60} x2={283} y2={60} />
      <Arr x1={401} y1={60} x2={423} y2={60} />
      <Arr x1={541} y1={60} x2={563} y2={60} />
      <path d="M620 91 L620 116 L202 116 L202 92" fill="none" stroke={ARR} strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#fdArrow)" />
      <text x={411} y={132} textAnchor="middle" fontSize={11} fill={SUB}>auto-settle → insights → thickens base rates</text>

      <text x={4} y={168} fontSize={14} fontWeight={500} fill={TXT}>Decision tree — control gate → openness → pair</text>
      <Node x={250} y={180} w={180} h={40} title="Storyline read" sub="corners + possession" />
      <Arr x1={340} y1={220} x2={340} y2={240} />

      <g>
        <rect x={190} y={240} width={300} height={74} rx={8} fill={TONES.box.fill} stroke={TONES.box.stroke} />
        <text x={340} y={262} textAnchor="middle" fontSize={13} fontWeight={500} fill={TXT}>Control strength?</text>
        <text x={340} y={282} textAnchor="middle" fontSize={11} fill={SUB}>CLEAR: poss gap ≥15 or corner margin ≥3.5 → ~90%</text>
        <text x={340} y={300} textAnchor="middle" fontSize={11} fill={SUB}>LEAN: ≥8 / ≥1.5 → ~77%   ·   else coin-flip</text>
      </g>
      <Arr x1={190} y1={277} x2={180} y2={277} />
      <text x={92} y={250} textAnchor="middle" fontSize={11} fill={SUB}>weak / conflict</text>
      <Node x={8} y={256} w={170} h={62} tone="box" title="Coin-flip — no edge"
        sub="check price vs sharp + lineup" sub2="else low-event Under / pass" />

      <Arr x1={340} y1={314} x2={340} y2={336} />
      <text x={358} y={330} fontSize={11} fill={SUB}>clear / lean</text>
      <Node x={250} y={336} w={180} h={40} title="Grind or romp?" />

      <Arr x1={340} y1={376} x2={175} y2={406} />
      <Arr x1={340} y1={376} x2={505} y2={406} />
      <Node x={30} y={406} w={290} h={72} tone="green" title="Grind-siege → Corner pair"
        sub="Corner-1x2 + team-corner over" sub2="corners layer · ~90% when clear" />
      <Node x={360} y={406} w={290} h={72} tone="amber" title="Romp / efficient → Margin pair"
        sub="handicap 1.0–1.5 + team-total (if soft D)" sub2="margin ~40% · goals ~35%" />

      <text x={4} y={512} fontSize={14} fontWeight={500} fill={TXT}>Variance ladder — one read, three layers</text>
      <Node x={4} y={524} w={210} h={56} tone="green" title="Corners — control" sub="~90% clear · lowest variance" />
      <Node x={235} y={524} w={210} h={56} tone="amber" title="Margin — +conversion" sub="~40% · needs cushion" />
      <Node x={466} y={524} w={210} h={56} tone="coral" title="Goals — +soft defense" sub="~35% · confirm or skip" />
      <Arr x1={214} y1={552} x2={235} y2={552} />
      <Arr x1={445} y1={552} x2={466} y2={552} />
      <text x={4} y={604} fontSize={11} fill={SUB}>Stake inversely to variance — downstream layers need cushion + confirmation, never bet as a certainty.</text>
    </svg>
  )
}
