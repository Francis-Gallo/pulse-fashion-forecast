import { useState } from 'react'

const BORDER = '#f3f4f6'
const PURPLE = '#ec4899'
const MUTED  = '#9ca3af'

export default function SignalFeed({ signals }) {
  const [filter, setFilter] = useState('All')

  if (!signals.length) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-mono" style={{ color: '#d4cfc9' }}>
        No signals yet. Run a forecast first.
      </div>
    )
  }

  const sources = ['All', ...new Set(signals.map(s => s.source))]
  const sorted = [...signals].sort((a, b) => b.score - a.score)
  const filtered = filter === 'All' ? sorted : sorted.filter(s => s.source === filter)

  return (
    <div>
      {/* Source filter */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="text-xs font-mono mr-2" style={{ color: MUTED }}>
          {signals.length} signals
        </span>
        {sources.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="text-xs font-mono px-2 py-0.5 border transition-colors"
            style={{
              borderColor: filter === s ? PURPLE : BORDER,
              color: filter === s ? PURPLE : MUTED,
              background: filter === s ? '#faf5ff' : 'transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Signal list */}
      <div className="space-y-1.5">
        {filtered.slice(0, 100).map((s, i) => (
          <div
            key={i}
            className="flex items-start justify-between px-4 py-2.5 border transition-colors"
            style={{ borderColor: BORDER, background: '#fff', borderRadius: '12px' }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className="text-xs font-mono shrink-0 mt-0.5"
                style={{ color: PURPLE, opacity: 0.7 }}
              >
                {s.source}
              </span>
              <span className="text-sm" style={{ color: '#374151' }}>
                {s.title}
              </span>
            </div>
            {s.score > 0 && (
              <span className="text-xs font-mono ml-4 shrink-0" style={{ color: '#d4cfc9' }}>
                {s.score.toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
