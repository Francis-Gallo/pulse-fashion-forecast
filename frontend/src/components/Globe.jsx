const ITEMS = [
  { emoji: '👗', label: 'Dress',    color: '#fce7f3', accent: '#ec4899', border: '#f9a8d4', x: '58%', y: '8%',  size: '6.5rem', delay: '0s',   dur: '4s'   },
  { emoji: '🧥', label: 'Jacket',   color: '#ede9fe', accent: '#8b5cf6', border: '#c4b5fd', x: '76%', y: '30%', size: '6rem',   delay: '1.1s', dur: '3.7s' },
  { emoji: '👟', label: 'Sneakers', color: '#dbeafe', accent: '#3b82f6', border: '#93c5fd', x: '62%', y: '58%', size: '5.5rem', delay: '0.5s', dur: '4.4s' },
  { emoji: '👜', label: 'Bag',      color: '#fef3c7', accent: '#f59e0b', border: '#fcd34d', x: '82%', y: '14%', size: '5rem',   delay: '2s',   dur: '3.9s' },
  { emoji: '👖', label: 'Denim',    color: '#d1fae5', accent: '#10b981', border: '#6ee7b7', x: '78%', y: '65%', size: '5.5rem', delay: '1.6s', dur: '4.2s' },
  { emoji: '🕶️', label: 'Shades',   color: '#fce7f3', accent: '#ec4899', border: '#f9a8d4', x: '88%', y: '44%', size: '4.5rem', delay: '0.8s', dur: '3.5s' },
]

export default function Globe() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg) scale(1); }
          50%       { transform: translateY(-22px) rotate(1.5deg) scale(1.02); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0px) rotate(1deg) scale(1); }
          50%       { transform: translateY(-16px) rotate(-1deg) scale(1.015); }
        }
      `}</style>

      {ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            animation: `${i % 2 === 0 ? 'floatUp' : 'floatDown'} ${item.dur} ease-in-out infinite`,
            animationDelay: item.delay,
          }}
        >
          <div
            style={{
              background: item.color,
              borderRadius: '28px',
              padding: '1.25rem 1.5rem',
              border: `1.5px solid ${item.border}`,
              boxShadow: `0 24px 48px rgba(0,0,0,0.06), 0 6px 20px ${item.accent}25`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              backdropFilter: 'blur(4px)',
              minWidth: '90px',
            }}
          >
            <span style={{ fontSize: item.size, lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>
              {item.emoji}
            </span>
            <span style={{
              fontSize: '0.6rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: item.accent,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
