import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as realApi from '../lib/api'

const CATEGORIES = [
  { id: 'compensation', label: 'Compensation', desc: 'Pay, benefits, equity, bonuses, or financial wellbeing' },
  { id: 'working_conditions', label: 'Working Conditions', desc: 'Hours, flexibility, environment, workload, or scheduling' },
  { id: 'other', label: 'Other', desc: 'Communication, culture, safety, or anything else' },
]

const TITLE_PLACEHOLDERS: Record<string, string> = {
  compensation: 'e.g. Pay freeze has not kept pace with inflation',
  working_conditions: 'e.g. Rigid start times create unnecessary hardship',
  other: 'e.g. Leadership communication needs to improve',
}

const FRAMING_PLACEHOLDERS: Record<string, string> = {
  compensation: 'e.g. The mandatory pay freeze has not kept pace with regional inflation over the past 18 months, affecting workers across all grade levels...',
  working_conditions: 'e.g. The mandatory 9am start time creates difficulty for workers with childcare or long commutes, and has no clear operational justification...',
  other: 'Describe the concern in a way any coworker would recognise.',
}

interface FormState {
  category: string
  title: string
  framing: string
  thresholdType: 'count'
  thresholdValue: number
  deadlineDays: 7 | 14 | 30
}

const DISPLAY: React.CSSProperties = { fontFamily: "'Big Shoulders Display', sans-serif" }

export default function CreateProposalPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    category: '',
    title: '',
    framing: '',
    thresholdType: 'count',
    thresholdValue: 5,
    deadlineDays: 14,
  })

  const canNext =
    (step === 1 && form.category !== '') ||
    (step === 2 && form.title.trim().length >= 5 && form.framing.trim().length >= 20) ||
    (step === 3 && form.thresholdValue >= 1) ||
    step === 4

  async function handlePublish() {
    setSubmitting(true)
    try {
      const { id } = await realApi.createProposal({
        category: form.category,
        templateFields: { title: form.title.trim(), framing: form.framing.trim() },
        thresholdType: form.thresholdType,
        thresholdValue: form.thresholdValue,
        deadlineDays: form.deadlineDays,
      })
      navigate(`/proposal/${id}`)
    } catch {
      setSubmitting(false)
    }
  }

  const CATEGORY_LABEL: Record<string, string> = {
    compensation: 'Compensation',
    working_conditions: 'Working Conditions',
    other: 'Other',
  }

  const stepPct = (step / 4) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 22, paddingBottom: 20 }}>
            <span style={{ ...DISPLAY, fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream)' }}>Wrkr</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 500, color: 'var(--cream-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
              Anonymous
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        {/* Step progress */}
        <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>
            Step {step} of 4
          </span>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}
            style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {step > 1 ? '← Back' : '✕ Cancel'}
          </button>
        </div>
        <div style={{ height: 2, background: 'var(--border)', marginBottom: 40 }}>
          <div style={{ height: '100%', width: `${stepPct}%`, background: 'var(--green)', boxShadow: '0 0 8px rgba(82,183,136,0.4)', transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>

        {/* Step 1 — Category */}
        {step === 1 && (
          <div>
            <div style={{ ...DISPLAY, fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.0, textTransform: 'uppercase', color: 'var(--cream)', marginBottom: 8 }}>
              What is this<br />about?
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cream-dim)', marginBottom: 36 }}>
              Choose the category that best fits the concern.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  style={{
                    background: form.category === cat.id ? 'var(--green-faint)' : 'var(--surface)',
                    border: '1px solid var(--border-mid)',
                    borderLeft: `3px solid ${form.category === cat.id ? 'var(--green)' : 'transparent'}`,
                    padding: '22px 22px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{ ...DISPLAY, fontWeight: 700, fontSize: '1.4rem', textTransform: 'uppercase', color: form.category === cat.id ? 'var(--green-glow)' : 'var(--cream)', marginBottom: 4 }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--cream-dim)' }}>{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Framing */}
        {step === 2 && (
          <div>
            <div style={{ ...DISPLAY, fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.0, textTransform: 'uppercase', color: 'var(--cream)', marginBottom: 8 }}>
              Frame<br />the concern
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cream-dim)', marginBottom: 36 }}>
              Be specific and factual. Avoid naming individuals.
            </p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.8, marginBottom: 10, display: 'block' }}>
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={TITLE_PLACEHOLDERS[form.category]}
                maxLength={80}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-mid)',
                  color: 'var(--cream)',
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  letterSpacing: '0.02em',
                  padding: '14px 16px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
              <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--cream-faint)', marginTop: 6 }}>
                {form.title.length}/80
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.8, marginBottom: 10, display: 'block' }}>
                What is the specific issue?
              </label>
              <textarea
                value={form.framing}
                onChange={e => setForm(f => ({ ...f, framing: e.target.value }))}
                placeholder={FRAMING_PLACEHOLDERS[form.category]}
                rows={6}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-mid)',
                  color: 'var(--cream)',
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  padding: 16,
                  resize: 'none',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
              />
              <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--cream-faint)', marginTop: 6 }}>
                {form.framing.length < 20
                  ? <span style={{ color: 'var(--cream-dim)' }}>{20 - form.framing.length} more characters needed</span>
                  : `${form.framing.length} chars`}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.75, marginBottom: 14 }}>
                If the threshold is reached, workers will
              </div>
              <div style={{ background: 'var(--green-faint)', border: '1px solid var(--border-mid)', borderLeft: '3px solid var(--green)', padding: '16px 18px' }}>
                <div style={{ ...DISPLAY, fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', color: 'var(--green-glow)' }}>Sign a collective message</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--cream-dim)', marginTop: 4 }}>A signed statement with threshold attestation is generated and shared with all committed workers.</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Threshold + Deadline */}
        {step === 3 && (
          <div>
            <div style={{ ...DISPLAY, fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.0, textTransform: 'uppercase', color: 'var(--cream)', marginBottom: 8 }}>
              Set the<br />threshold
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cream-dim)', marginBottom: 36 }}>
              How many workers need to commit before the action activates?
            </p>

            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.8, marginBottom: 10, display: 'block' }}>
                Number of workers
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
                  <button
                    onClick={() => setForm(f => ({ ...f, thresholdValue: Math.max(1, f.thresholdValue - 1) }))}
                    style={{ width: 44, height: 56, background: 'none', border: 'none', color: 'var(--cream-dim)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <div style={{ ...DISPLAY, fontWeight: 900, fontSize: '2.4rem', color: 'var(--green)', width: 60, textAlign: 'center', padding: '0 4px', textShadow: '0 0 20px rgba(82,183,136,0.3)' }}>
                    {form.thresholdValue}
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, thresholdValue: f.thresholdValue + 1 }))}
                    style={{ width: 44, height: 56, background: 'none', border: 'none', color: 'var(--cream-dim)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
                <span style={{ ...DISPLAY, fontWeight: 500, fontSize: '1.1rem', color: 'var(--cream-faint)', margin: '0 12px' }}>workers</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', fontStyle: 'italic' }}>
                <strong style={{ color: 'var(--green)', fontStyle: 'normal' }}>{form.thresholdValue} workers</strong> need to commit before this activates.
              </p>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.8, marginBottom: 10, display: 'block' }}>
                Deadline
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {([7, 14, 30] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, deadlineDays: d }))}
                    style={{
                      flex: 1,
                      background: form.deadlineDays === d ? 'var(--green-faint)' : 'var(--surface)',
                      border: '1px solid var(--border-mid)',
                      borderLeft: `3px solid ${form.deadlineDays === d ? 'var(--green)' : 'transparent'}`,
                      color: form.deadlineDays === d ? 'var(--green-glow)' : 'var(--cream-dim)',
                      fontFamily: "'Big Shoulders Display', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      padding: '14px 12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <div style={{ ...DISPLAY, fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.0, textTransform: 'uppercase', color: 'var(--cream)', marginBottom: 8 }}>
              Review &<br />publish
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cream-dim)', marginBottom: 36 }}>
              Once published, this proposal is visible to all workspace members.
            </p>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', borderLeft: '3px solid var(--green)', padding: 24, marginBottom: 28 }}>
              {[
                { key: 'Category', val: CATEGORY_LABEL[form.category] },
                { key: 'Title', val: form.title },
                { key: 'Concern', val: form.framing },
                { key: 'If threshold met', val: 'Sign a collective message' },
                { key: 'Threshold', val: `${form.thresholdValue} workers`, green: true },
                { key: 'Deadline', val: `${form.deadlineDays} days` },
                { key: 'Attribution', val: 'Fully anonymous' },
              ].map(row => (
                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>{row.key}</span>
                  <span style={{ fontSize: '0.86rem', color: row.green ? 'var(--green)' : 'var(--cream)', fontWeight: 500, textAlign: 'right', maxWidth: 340 }}>{row.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>Attribution</span>
                <span style={{ fontSize: '0.86rem', color: 'var(--cream)', fontWeight: 500 }}>Fully anonymous</span>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cream-dim)', marginBottom: 28 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)', display: 'inline-block' }} />
              This proposal will be published anonymously — your identity is not recorded
            </div>
          </div>
        )}

        {/* Nav button */}
        <div style={{ marginBottom: 40 }}>
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              style={{
                width: '100%',
                background: canNext ? 'var(--green)' : 'var(--cream-faint)',
                color: 'var(--bg)',
                border: 'none',
                padding: '18px 24px',
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: canNext ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.15s',
              }}
            >
              <span>Continue</span><span>→</span>
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={submitting}
              style={{
                width: '100%',
                background: 'var(--green)',
                color: 'var(--bg)',
                border: 'none',
                padding: '18px 24px',
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: submitting ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
            >
              <span>{submitting ? 'Publishing…' : 'Publish anonymously'}</span>
              {!submitting && <span>→</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
