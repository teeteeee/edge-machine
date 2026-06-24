// Team archetypes are RELATIONAL — a role is the "reaction" between two teams, not a fixed label.
// Each team carries intrinsic properties (tier = strength, lean = temperament); the role on the card
// is RESOLVED from the matchup. Senegal is The Wall vs France, but the Siege Engine vs a minnow.
export type Arche = {
  key: string
  label: string
  emoji: string
  expect: string
  tone: 'engine' | 'bus' | 'wall' | 'counter' | 'killer' | 'minnow'
}

export const ARCHETYPES: Record<Arche['tone'], Arche> = {
  engine:  { key: 'engine',  label: 'Siege Engine',    emoji: '🏰', expect: 'The stronger possession side here — hogs the ball, piles up corners.', tone: 'engine' },
  bus:     { key: 'bus',     label: 'Bus Parker',      emoji: '🧱', expect: 'The deeper side here — sits in, soaks pressure, concedes corners not goals (siege holds).', tone: 'bus' },
  wall:    { key: 'wall',    label: 'The Wall',        emoji: '🛡️', expect: 'Out-gunned but elite at the back — frustrates the favorite, keeps it low-scoring.', tone: 'wall' },
  counter: { key: 'counter', label: 'Counter-Striker', emoji: '⚡', expect: 'The reactive side here — cedes the ball, breaks fast, chases when behind (siege breaks).', tone: 'counter' },
  killer:  { key: 'killer',  label: 'Clinical Killer', emoji: '🎯', expect: 'The stronger side, but efficient not dominant — wins without the siege (few corners).', tone: 'killer' },
  minnow:  { key: 'minnow',  label: 'Minnow',          emoji: '🐟', expect: 'Heavily out-matched here — blowout / run-it-up risk; favorite’s team-total over.', tone: 'minnow' },
}

// Intrinsic team properties. tier = strength (1 weak … 5 elite); lean = temperament.
//   siege = wants the ball/attacks · counter = happy without it, breaks fast · rock = elite defense
//   bus = ordinary deep block · fragile = simply over-matched
type Lean = 'siege' | 'counter' | 'rock' | 'bus' | 'fragile'
type Team = { tier: number; lean: Lean }

const TEAMS: Record<string, Team> = {
  France: { tier: 5, lean: 'siege' },     Senegal: { tier: 4, lean: 'rock' },
  Iraq: { tier: 2, lean: 'bus' },         Norway: { tier: 4, lean: 'siege' },
  Argentina: { tier: 5, lean: 'siege' },  Algeria: { tier: 3, lean: 'counter' },
  Austria: { tier: 3, lean: 'siege' },    Jordan: { tier: 2, lean: 'bus' },
  Spain: { tier: 5, lean: 'siege' },      Uruguay: { tier: 4, lean: 'siege' },
  Switzerland: { tier: 4, lean: 'siege' }, Germany: { tier: 5, lean: 'siege' },
  Canada: { tier: 3, lean: 'siege' },     Netherlands: { tier: 4, lean: 'siege' },
  Brazil: { tier: 5, lean: 'siege' },     Türkiye: { tier: 3, lean: 'counter' }, Turkey: { tier: 3, lean: 'counter' },
  // Egypt up-rated, Belgium down-rated after Belgium 2-7 Egypt — recalibrated reagents (stale-valence lesson).
  Egypt: { tier: 3, lean: 'siege' },      Morocco: { tier: 4, lean: 'rock' },
  Belgium: { tier: 3, lean: 'siege' },
  USA: { tier: 3, lean: 'counter' },      'United States': { tier: 3, lean: 'counter' },
  Sweden: { tier: 3, lean: 'counter' },   Paraguay: { tier: 2, lean: 'counter' }, Ecuador: { tier: 3, lean: 'counter' },
  'Saudi Arabia': { tier: 2, lean: 'bus' }, Qatar: { tier: 2, lean: 'bus' },
  'Cape Verde': { tier: 1, lean: 'fragile' }, 'Curaçao': { tier: 1, lean: 'fragile' }, Curacao: { tier: 1, lean: 'fragile' },
  Haiti: { tier: 1, lean: 'fragile' },    'South Africa': { tier: 2, lean: 'fragile' }, 'New Zealand': { tier: 2, lean: 'bus' },
}

function lookup(name: string): Team | null {
  const n = (name || '').trim()
  if (!n) return null
  if (TEAMS[n]) return TEAMS[n]
  for (const [k, v] of Object.entries(TEAMS)) if (n.includes(k) || k.includes(n)) return v
  return null
}

// "Valence" — how hard a side will lay siege (tier + temperament). Backtest: gap predicts the
// corner-dominant side at r=0.81. Below CONTESTED_GAP the reaction is near-equilibrium (ΔG≈0) →
// no spontaneous direction → don't trust the corner read.
const LADJ: Record<Lean, number> = { siege: 1.0, rock: 0, counter: -0.6, bus: -0.6, fragile: -1.2 }
const siegeScore = (t: Team) => t.tier + LADJ[t.lean]
export const CONTESTED_GAP = 1.2

// The reaction: resolve `self`'s role given the opponent.
function react(self: Team, opp: Team): Arche {
  const gap = self.tier - opp.tier
  if (gap >= 1) return self.lean === 'counter' ? ARCHETYPES.killer : ARCHETYPES.engine // stronger → proactive
  if (gap <= -1) {
    // weaker → reactive role by temperament
    if (self.lean === 'rock') return ARCHETYPES.wall
    if (self.lean === 'counter') return ARCHETYPES.counter
    if (self.lean === 'fragile' || gap <= -3) return ARCHETYPES.minnow
    return ARCHETYPES.bus
  }
  // even → temperament decides
  return self.lean === 'rock' ? ARCHETYPES.wall
    : self.lean === 'counter' ? ARCHETYPES.counter
    : self.lean === 'fragile' ? ARCHETYPES.minnow
    : self.lean === 'bus' ? ARCHETYPES.bus
    : ARCHETYPES.engine
}

/** Roles emerge from the pairing. `contested` = valences too close to call the corner direction.
 *  Falls back to a solo read if the opponent is unmapped. */
export function matchupRoles(
  homeName: string,
  awayName: string,
): { home: Arche | null; away: Arche | null; gap: number | null; contested: boolean } {
  const h = lookup(homeName)
  const a = lookup(awayName)
  const solo = (t: Team | null): Arche | null =>
    !t ? null
      : t.lean === 'rock' ? ARCHETYPES.wall
      : t.lean === 'counter' ? ARCHETYPES.counter
      : t.lean === 'fragile' ? ARCHETYPES.minnow
      : t.lean === 'bus' ? ARCHETYPES.bus
      : ARCHETYPES.engine
  const gap = h && a ? siegeScore(h) - siegeScore(a) : null
  return {
    home: h && a ? react(h, a) : solo(h),
    away: h && a ? react(a, h) : solo(a),
    gap,
    contested: gap !== null && Math.abs(gap) < CONTESTED_GAP,
  }
}

export const ARCHE_TONE: Record<Arche['tone'], string> = {
  engine:  'bg-yes/10 text-yes',
  bus:     'bg-slate-500/15 text-slate-300',
  wall:    'bg-sky-500/10 text-sky-400',
  counter: 'bg-amber-400/10 text-amber-400',
  killer:  'bg-no/10 text-no',
  minnow:  'bg-zinc-500/15 text-zinc-400',
}
