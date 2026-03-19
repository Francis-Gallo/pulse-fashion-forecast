import { useState } from 'react'

const MOMENTUM = {
  rising:   { label: 'Rising',   color: '#10b981', bg: '#d1fae5' },
  emerging: { label: 'Emerging', color: '#8b5cf6', bg: '#ede9fe' },
  peaking:  { label: 'Peaking',  color: '#f59e0b', bg: '#fef3c7' },
  stable:   { label: 'Stable',   color: '#6b7280', bg: '#f3f4f6' },
  declining:{ label: 'Declining',color: '#ef4444', bg: '#fee2e2' },
}

const RANK_COLORS = [
  { from: '#ec4899', to: '#f472b6' },
  { from: '#8b5cf6', to: '#a78bfa' },
  { from: '#3b82f6', to: '#60a5fa' },
  { from: '#10b981', to: '#34d399' },
  { from: '#f59e0b', to: '#fbbf24' },
]

export default function TrendCard({ rank, trend }) {
  const [open, setOpen] = useState(false)
  const m = MOMENTUM[trend.momentum] || MOMENTUM.rising
  const conf = trend.confidence || 0
  const rc = RANK_COLORS[(rank - 1) % RANK_COLORS.length]

  return (
    <div
      className="rounded-2xl p-6 cursor-pointer transition-all"
      style={{ background: '#fff', boxShadow: open ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)' }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center gap-6">

        {/* Rank pill */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})` }}
        >
          {rank}
        </div>

        {/* Name */}
        <h3 className="serif flex-1 text-lg font-bold" style={{ color: '#0f0f0f' }}>
          {trend.name}
        </h3>

        {/* Badges */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#f9fafb', color: '#6b7280' }}>
            {trend.category}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: m.bg, color: m.color }}>
            {m.label}
          </span>
        </div>

        {/* Timeline */}
        {trend.goes_mainstream && (
          <span className="text-sm font-mono shrink-0 font-medium" style={{ color: '#ec4899' }}>
            {trend.goes_mainstream}
          </span>
        )}

        {/* Confidence */}
        <div className="text-right shrink-0">
          <span className="serif text-2xl font-bold" style={{ color: rc.from }}>{conf}%</span>
        </div>

        {/* Toggle */}
        <span className="text-lg shrink-0" style={{ color: '#d1d5db' }}>{open ? '−' : '+'}</span>
      </div>

      {/* Expanded */}
      {open && (
        <div className="mt-5 ml-16 space-y-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#d1d5db' }}>
              Why it's emerging
            </div>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: '#6b7280' }}>
              {trend.why_now || trend.summary}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span
              className="text-xs font-mono px-3 py-1 rounded-full shrink-0 font-medium"
              style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})`, color: '#fff' }}
            >
              ACTION
            </span>
            <p className="text-sm" style={{ color: '#9ca3af' }}>{trend.action}</p>
          </div>

          {/* Confidence bar */}
          <div className="h-1.5 rounded-full max-w-xs overflow-hidden" style={{ background: '#f3f4f6' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${conf}%`, background: `linear-gradient(90deg, ${rc.from}, ${rc.to})` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
