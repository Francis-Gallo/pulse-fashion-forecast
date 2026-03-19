import { useState } from 'react'
import Globe from './components/Globe'
import TrendCard from './components/TrendCard'
import SignalFeed from './components/SignalFeed'
import ControlPanel from './components/ControlPanel'

const API = 'http://localhost:8000'

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm transition-colors"
      style={{ color: active ? '#0f0f0f' : '#9ca3af', fontWeight: active ? 500 : 400 }}
    >
      {label}
    </button>
  )
}

function HistorySection({ history }) {
  if (!history.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#d1d5db' }}>
        No history yet.
      </div>
    )
  }
  return (
    <div>
      <h2 className="serif text-2xl italic mb-6" style={{ color: '#0f0f0f' }}>Past Forecasts</h2>
      <div className="space-y-3">
        {history.map((h, i) => (
          <div key={i} className="border rounded-2xl p-5" style={{ borderColor: '#f3f4f6', background: '#fff' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>
                {new Date(h.timestamp).toLocaleString()}
              </span>
              <span className="text-xs font-mono" style={{ color: '#ec4899' }}>
                {h.signals} signals
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(h.result.trends || []).map((t, j) => (
                <span key={j} className="text-xs px-3 py-1 rounded-full" style={{ background: '#fdf4ff', color: '#a855f7' }}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExportBtn({ analysis, signals }) {
  const handleExport = () => {
    const lines = [
      'Fashion Trend Forecast — Pulse',
      `Generated: ${new Date().toISOString()}`,
      `Signals analyzed: ${signals.length}`,
      `Overall: ${analysis.summary || ''}`,
      '',
      'FORECASTED TRENDS',
      '',
      ...(analysis.trends || []).flatMap((t, i) => [
        `${i + 1}. ${t.name} [${t.category}] — ${t.confidence}% confidence`,
        `   Going mainstream: ${t.goes_mainstream || 'unknown'}`,
        `   Why now: ${t.why_now || t.summary}`,
        `   Action: ${t.action}`,
        '',
      ]),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fashion_forecast_${Date.now()}.txt`
    a.click()
  }
  return (
    <button
      onClick={handleExport}
      className="text-xs font-mono px-4 py-2 rounded-full border transition-colors"
      style={{ borderColor: '#e5e7eb', color: '#9ca3af' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.color = '#ec4899' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af' }}
    >
      Export
    </button>
  )
}

export default function App() {
  const [lmUrl, setLmUrl]       = useState('http://localhost:1234/v1')
  const [model, setModel]       = useState('')
  const [models, setModels]     = useState([])
  const [groqKey, setGroqKey]   = useState('')
  const [signals, setSignals]   = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState('')
  const [history, setHistory]   = useState([])
  const [activeTab, setActiveTab] = useState('forecast')
  const [error, setError]       = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const fetchModels = async (url) => {
    try {
      const res = await fetch(`${API}/api/models?lm_url=${encodeURIComponent(url)}`)
      const data = await res.json()
      setModels(data.models || [])
      if (data.models?.length > 0) setModel(data.models[0])
    } catch {
      setModels([])
    }
  }

  const run = async (config) => {
    setLoading(true)
    setError(null)
    setPanelOpen(false)
    try {
      setStep('collecting signals...')
      const fetchRes = await fetch(`${API}/api/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const { signals: fetched } = await fetchRes.json()
      setSignals(fetched)

      setStep('forecasting trends...')
      const analyzeRes = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signals: fetched, lm_url: lmUrl, model, groq_api_key: config.groq_api_key || '' }),
      })
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json()
        throw new Error(err.detail || 'Forecast failed')
      }
      const result = await analyzeRes.json()
      setAnalysis(result)
      setActiveTab('forecast')
      setHistory(prev => [
        { timestamp: new Date().toISOString(), signals: fetched.length, result },
        ...prev.slice(0, 9),
      ])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', color: '#0f0f0f' }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4"
        style={{ background: 'rgba(250,250,250,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f3f4f6' }}
      >
        <span className="serif text-lg font-bold italic" style={{ color: '#0f0f0f' }}>Pulse</span>
        <div className="flex items-center gap-7">
          <NavBtn label="Forecast" active={activeTab === 'forecast'} onClick={() => setActiveTab('forecast')} />
          <NavBtn label="Signals"  active={activeTab === 'signals'}  onClick={() => setActiveTab('signals')} />
          <NavBtn label="History"  active={activeTab === 'history'}  onClick={() => setActiveTab('history')} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: (groqKey || models.length > 0) ? '#10b981' : '#f87171' }} />
            <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>
              {groqKey ? 'groq / llama-3.1-8b' : models.length > 0 ? model : 'disconnected'}
            </span>
          </div>
          <button
            onClick={() => setPanelOpen(p => !p)}
            className="text-xs px-4 py-2 rounded-full transition-colors"
            style={{
              background: panelOpen ? '#ec4899' : '#f3f4f6',
              color: panelOpen ? '#fff' : '#6b7280',
            }}
          >
            Sources
          </button>
        </div>
      </nav>

      {/* Sources slide panel */}
      {panelOpen && (
        <div
          className="fixed right-0 z-40 w-80 border-l p-6 overflow-y-auto"
          style={{ top: '61px', bottom: 0, background: '#fff', borderColor: '#f3f4f6' }}
        >
          <ControlPanel
            lmUrl={lmUrl} setLmUrl={setLmUrl}
            model={model} setModel={setModel}
            models={models}
            onFetchModels={() => fetchModels(lmUrl)}
            onRun={run} loading={loading} step={step}
            groqKey={groqKey} setGroqKey={setGroqKey}
          />
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '100vh', paddingTop: '61px' }}>

        {/* Gradient bg */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 30%, #ede9fe 60%, #dbeafe 100%)' }}
        />

        {/* 3D items */}
        <div className="absolute inset-0">
          <Globe />
        </div>

        {/* Text overlay — left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(253,244,255,0.92) 40%, rgba(253,244,255,0.3) 65%, transparent 85%)' }}
        />

        <div className="relative z-10 flex flex-col justify-center h-full pl-16" style={{ pointerEvents: 'none' }}>
          <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: '#ec4899' }}>
            Predictive Fashion Intelligence
          </p>
          <h1 className="serif leading-none mb-1" style={{ fontSize: '6rem', color: '#0f0f0f' }}>
            Trend.
          </h1>
          <h1 className="serif italic leading-none mb-8" style={{ fontSize: '6rem', color: '#d1d5db' }}>
            Predicted.
          </h1>
          <p className="text-sm max-w-xs mb-8" style={{ color: '#9ca3af', lineHeight: 1.8 }}>
            Detect what will dominate fashion 3 to 6 months before it hits the mainstream.
          </p>

          <button
            onClick={() => setPanelOpen(p => !p)}
            className="w-fit text-sm px-8 py-3 rounded-full transition-all mb-6"
            style={{
              background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: loading ? '#9ca3af' : '#fff',
              pointerEvents: 'auto',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(236,72,153,0.3)',
            }}
          >
            {loading ? (step || 'processing...') : 'Run Forecast'}
          </button>

          {error && (
            <p className="mb-4 text-xs font-mono" style={{ color: '#ef4444' }}>{error}</p>
          )}

          {analysis && (
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Signals', value: signals.length },
                { label: 'Trends', value: (analysis.trends || []).length },
                { label: 'Theme', value: analysis.top_theme },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
                  <div className="serif text-xl font-bold" style={{ color: '#0f0f0f' }}>{value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {analysis && (
            <div className="mt-4 max-w-sm rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{analysis.summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content below */}
      <div className="px-16 py-16" style={{ background: '#fafafa' }}>

        {activeTab === 'forecast' && (
          <>
            {!analysis ? (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="serif text-xl italic" style={{ color: '#e5e7eb' }}>Open Sources and run a forecast.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="serif text-3xl" style={{ color: '#0f0f0f' }}>
                    What's Next in Fashion
                    <span className="italic text-2xl ml-3" style={{ color: '#d1d5db' }}>
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </h2>
                  <ExportBtn analysis={analysis} signals={signals} />
                </div>
                <div className="space-y-4">
                  {(analysis.trends || []).map((trend, i) => (
                    <TrendCard key={i} rank={i + 1} trend={trend} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'signals' && (
          <div className="max-w-4xl">
            <h2 className="serif text-3xl mb-8">Raw Signals</h2>
            <SignalFeed signals={signals} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-3xl">
            <HistorySection history={history} />
          </div>
        )}

      </div>
    </div>
  )
}
