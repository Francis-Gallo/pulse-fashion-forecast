import { useState } from 'react'

const PRESETS = {
  Streetwear: ['streetwear', 'malefashionadvice', 'femalefashionadvice', 'Sneakers', 'FashionReps', 'Outfit'],
  Luxury:     ['fashion', 'handbags', 'jewelry', 'findfashion', 'womensstreetwear', 'Watches'],
  Vintage:    ['VintageFashion', 'ThriftStoreHauls', 'vintage', 'thrifted', 'capsulewardrobe'],
  Lifestyle:  ['LifestyleFashion', 'Beauty', 'Hair', 'MakeupAddiction', 'SkincareAddiction'],
}

const PRESET_COLORS = {
  Streetwear: { bg: '#fdf2f8', border: '#f9a8d4', text: '#ec4899' },
  Luxury:     { bg: '#f5f3ff', border: '#c4b5fd', text: '#7c3aed' },
  Vintage:    { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
  Lifestyle:  { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
}

const RSS_OPTIONS = [
  'Hypebeast',
  'The Cut',
  'Business of Fashion',
  'Vogue',
  'WWD',
  'Refinery29',
]

function SectionLabel({ children }) {
  return (
    <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#d1d5db' }}>
      {children}
    </div>
  )
}

export default function ControlPanel({ lmUrl, setLmUrl, model, setModel, models, onFetchModels, onRun, loading, step, groqKey, setGroqKey }) {
  const [selectedSubs, setSelectedSubs] = useState(['streetwear', 'femalefashionadvice', 'fashion'])
  const [selectedRSS, setSelectedRSS]   = useState(['Hypebeast', 'The Cut', 'Business of Fashion'])
  const [manualText, setManualText]     = useState('')
  const [customSub, setCustomSub]       = useState('')
  const [mode, setMode]                 = useState(groqKey ? 'groq' : 'local')
  const [useGtrends, setUseGtrends]     = useState(false)

  const toggleSub = (sub) =>
    setSelectedSubs(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub])

  const toggleRSS = (feed) =>
    setSelectedRSS(prev => prev.includes(feed) ? prev.filter(f => f !== feed) : [...prev, feed])

  const togglePreset = (name) => {
    const subs = PRESETS[name]
    const allActive = subs.every(s => selectedSubs.includes(s))
    if (allActive) {
      setSelectedSubs(prev => prev.filter(s => !subs.includes(s)))
    } else {
      setSelectedSubs(prev => [...new Set([...prev, ...subs])])
    }
  }

  const isPresetActive = (name) => PRESETS[name].some(s => selectedSubs.includes(s))
  const isPresetFull   = (name) => PRESETS[name].every(s => selectedSubs.includes(s))

  const addCustomSub = () => {
    if (customSub.trim()) {
      toggleSub(customSub.trim())
      setCustomSub('')
    }
  }

  const handleRun = () => onRun({
    reddit_subs: selectedSubs,
    reddit_limit: 20,
    rss_feeds: selectedRSS,
    manual_text: manualText,
    use_gtrends: useGtrends,
    groq_api_key: mode === 'groq' ? groqKey : '',
  })

  return (
    <div className="space-y-7 text-sm">

      {/* Model Mode Toggle */}
      <div>
        <SectionLabel>Model</SectionLabel>
        <div className="flex gap-2 mb-3">
          {['groq', 'local'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 text-xs font-mono py-2 rounded-xl border transition-all"
              style={{
                background:  mode === m ? '#fdf2f8' : '#fff',
                borderColor: mode === m ? '#f9a8d4' : '#f3f4f6',
                color:       mode === m ? '#ec4899' : '#9ca3af',
                fontWeight:  mode === m ? 600 : 400,
              }}
            >
              {m === 'groq' ? 'Groq Cloud' : 'LM Studio'}
            </button>
          ))}
        </div>

        {mode === 'groq' ? (
          <div>
            <input
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              type="password"
              className="w-full border px-3 py-2 text-xs font-mono rounded-lg"
              style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
            />
            {groqKey && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16a34a' }} />
                <span className="text-xs font-mono" style={{ color: '#16a34a' }}>llama-3.1-8b-instant</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              value={lmUrl}
              onChange={e => setLmUrl(e.target.value)}
              className="w-full border px-3 py-2 mb-2 text-xs font-mono rounded-lg"
              style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
              placeholder="http://localhost:1234/v1"
            />
            <div className="flex gap-2">
              {models.length > 0 ? (
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="flex-1 border px-2 py-1.5 text-xs font-mono rounded-lg"
                  style={{ borderColor: '#e5e7eb', background: '#fff', color: '#7c3aed' }}
                >
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="model name"
                  className="flex-1 border px-3 py-1.5 text-xs font-mono rounded-lg"
                  style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
                />
              )}
              <button
                onClick={onFetchModels}
                className="text-xs font-mono px-3 border rounded-lg transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#9ca3af', background: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.color = '#ec4899' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af' }}
              >
                Connect
              </button>
            </div>
            {models.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16a34a' }} />
                <span className="text-xs font-mono" style={{ color: '#16a34a' }}>
                  {models.length} model{models.length > 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reddit — preset pills */}
      <div>
        <SectionLabel>Reddit</SectionLabel>

        {/* Category presets */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(PRESETS).map(([name]) => {
            const c = PRESET_COLORS[name]
            const full   = isPresetFull(name)
            const active = isPresetActive(name)
            return (
              <button
                key={name}
                onClick={() => togglePreset(name)}
                className="text-xs font-mono py-2 px-3 rounded-xl border text-left transition-all"
                style={{
                  background:   active ? c.bg : '#fff',
                  borderColor:  active ? c.border : '#f3f4f6',
                  color:        active ? c.text : '#9ca3af',
                  fontWeight:   active ? 600 : 400,
                  opacity:      full ? 1 : active ? 0.85 : 1,
                }}
              >
                {name}
                <span className="ml-1 opacity-60">
                  {PRESETS[name].filter(s => selectedSubs.includes(s)).length}/{PRESETS[name].length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected subs as removable chips */}
        {selectedSubs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f3f4f6' }}>
            {selectedSubs.map(sub => (
              <span
                key={sub}
                className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: '#fdf2f8', color: '#ec4899', border: '1px solid #fce7f3' }}
              >
                r/{sub}
                <button onClick={() => toggleSub(sub)} style={{ color: '#f9a8d4', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Custom sub input */}
        <div className="flex gap-2">
          <input
            value={customSub}
            onChange={e => setCustomSub(e.target.value)}
            placeholder="add subreddit..."
            className="flex-1 border px-3 py-1.5 text-xs font-mono rounded-lg"
            style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
            onKeyDown={e => e.key === 'Enter' && addCustomSub()}
          />
          <button
            onClick={addCustomSub}
            className="text-xs border px-3 rounded-lg transition-colors"
            style={{ borderColor: '#e5e7eb', color: '#9ca3af', background: '#fff' }}
          >+</button>
        </div>
      </div>

      {/* RSS Feeds */}
      <div>
        <SectionLabel>RSS Feeds</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {RSS_OPTIONS.map(feed => {
            const active = selectedRSS.includes(feed)
            return (
              <button
                key={feed}
                onClick={() => toggleRSS(feed)}
                className="text-xs font-mono py-2 px-3 rounded-xl border text-left transition-all"
                style={{
                  background:  active ? '#fdf2f8' : '#fff',
                  borderColor: active ? '#f9a8d4' : '#f3f4f6',
                  color:       active ? '#ec4899' : '#9ca3af',
                  fontWeight:  active ? 600 : 400,
                }}
              >
                {feed}
              </button>
            )
          })}
        </div>
      </div>

      {/* Google Trends */}
      <div>
        <SectionLabel>Google Trends</SectionLabel>
        <button
          onClick={() => setUseGtrends(g => !g)}
          className="w-full text-xs font-mono py-2 px-3 rounded-xl border text-left transition-all"
          style={{
            background:  useGtrends ? '#fdf2f8' : '#fff',
            borderColor: useGtrends ? '#f9a8d4' : '#f3f4f6',
            color:       useGtrends ? '#ec4899' : '#9ca3af',
            fontWeight:  useGtrends ? 600 : 400,
          }}
        >
          {useGtrends ? 'ON — ' : 'OFF — '}
          fashion keyword search trends (live)
        </button>
      </div>

      {/* Manual Input */}
      <div>
        <SectionLabel>Manual Input</SectionLabel>
        <textarea
          value={manualText}
          onChange={e => setManualText(e.target.value)}
          placeholder="One signal per line..."
          rows={3}
          className="w-full border px-3 py-2 resize-none text-xs font-mono rounded-xl"
          style={{ borderColor: '#f3f4f6', background: '#fafafa', color: '#6b7280' }}
        />
      </div>

      {/* Run */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full py-3 text-sm font-mono tracking-wide rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:  loading ? '#f3f4f6' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          color:       loading ? '#9ca3af' : '#fff',
          boxShadow:   loading ? 'none' : '0 4px 20px rgba(236,72,153,0.3)',
        }}
      >
        {loading ? (step || 'processing...') : 'run forecast'}
      </button>

    </div>
  )
}
