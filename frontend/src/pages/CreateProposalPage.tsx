import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProposal } from '../lib/api'

const CATEGORIES = [
  { id: 'compensation', label: 'Compensation', desc: 'Pay, benefits, bonuses, equity' },
  { id: 'working_conditions', label: 'Working Conditions', desc: 'Hours, location, environment, policy' },
  { id: 'other', label: 'Other', desc: 'Anything else affecting your work' },
]

const PLACEHOLDERS: Record<string, string> = {
  compensation: 'E.g. We are requesting a 10% cost-of-living adjustment effective Q3, reflecting the regional inflation rate over the past 18 months.',
  working_conditions: 'E.g. We are requesting the option to work remotely up to 3 days per week, with in-office presence required on Tuesdays and Thursdays.',
  other: 'Describe what you\'re asking for and why it matters to your team.',
}

interface FormState {
  category: string
  framing: string
  thresholdType: 'count'
  thresholdValue: number
  deadlineDays: 7 | 14 | 30
}

export default function CreateProposalPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    category: '',
    framing: '',
    thresholdType: 'count',
    thresholdValue: 5,
    deadlineDays: 14,
  })

  const canNext =
    (step === 1 && form.category !== '') ||
    (step === 2 && form.framing.trim().length >= 20) ||
    (step === 3 && form.thresholdValue >= 1) ||
    step === 4

  async function handlePublish() {
    setSubmitting(true)
    try {
      const { id } = await createProposal({
        category: form.category,
        templateFields: { framing: form.framing.trim() },
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-7 h-14"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => (step > 1 ? setStep(s => s - 1) : navigate('/'))}
          className="text-sm transition-opacity hover:opacity-60"
          style={{ color: 'var(--cream-dim)' }}
        >
          ← {step > 1 ? 'Back' : 'Cancel'}
        </button>
        <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
          {step} / 4
        </span>
      </div>

      <div className="max-w-[720px] mx-auto px-7 py-10">

        {/* Step 1 — Category */}
        {step === 1 && (
          <div>
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--cream)' }}
            >
              What's this about?
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--cream-dim)' }}>
              Choose a category for your proposal.
            </p>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className="w-full text-left p-5 rounded-2xl transition-all"
                  style={{
                    background: form.category === cat.id ? 'var(--green-faint)' : 'var(--surface)',
                    border: `1px solid ${form.category === cat.id ? 'var(--green-dim)' : 'var(--border)'}`,
                  }}
                >
                  <p
                    className="font-semibold mb-1"
                    style={{ color: form.category === cat.id ? 'var(--green)' : 'var(--cream)' }}
                  >
                    {cat.label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
                    {cat.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Framing */}
        {step === 2 && (
          <div>
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--cream)' }}
            >
              Frame your ask
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--cream-dim)' }}>
              State what you're requesting and why. Be specific, avoid naming individuals.
            </p>
            <textarea
              value={form.framing}
              onChange={e => setForm(f => ({ ...f, framing: e.target.value }))}
              placeholder={PLACEHOLDERS[form.category]}
              rows={7}
              className="w-full resize-none rounded-2xl p-5 text-sm leading-relaxed outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--cream)',
                fontFamily: 'inherit',
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
                {form.framing.length < 20 ? `${20 - form.framing.length} more characters needed` : ''}
              </span>
              <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
                {form.framing.length} chars
              </span>
            </div>
            {/* Locked commitment type */}
            <div
              className="mt-6 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--cream-dim)' }}>
                  Commitment type
                </p>
                <p className="text-sm" style={{ color: 'var(--cream)' }}>
                  Sign a message if the threshold is reached
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Threshold + Deadline */}
        {step === 3 && (
          <div>
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--cream)' }}
            >
              Set the bar
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--cream-dim)' }}>
              How many workers need to commit before this activates?
            </p>

            {/* Threshold adjuster */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--cream-dim)' }}>
                Threshold
              </p>
              <div className="flex items-center gap-5 justify-center">
                <button
                  onClick={() => setForm(f => ({ ...f, thresholdValue: Math.max(1, f.thresholdValue - 1) }))}
                  className="w-12 h-12 rounded-full text-xl font-bold flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ background: 'var(--surface-2)', color: 'var(--cream)' }}
                >
                  −
                </button>
                <span
                  className="text-6xl font-black w-24 text-center"
                  style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: 'var(--cream)' }}
                >
                  {form.thresholdValue}
                </span>
                <button
                  onClick={() => setForm(f => ({ ...f, thresholdValue: f.thresholdValue + 1 }))}
                  className="w-12 h-12 rounded-full text-xl font-bold flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ background: 'var(--surface-2)', color: 'var(--cream)' }}
                >
                  +
                </button>
              </div>
              <p className="text-center text-sm mt-3" style={{ color: 'var(--cream-dim)' }}>
                workers must commit
              </p>
            </div>

            {/* Deadline pills */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--cream-dim)' }}>
                Deadline
              </p>
              <div className="flex gap-3">
                {([7, 14, 30] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, deadlineDays: d }))}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: form.deadlineDays === d ? 'var(--green)' : 'var(--surface-2)',
                      color: form.deadlineDays === d ? '#111511' : 'var(--cream-dim)',
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
            <h1
              className="text-4xl mb-2"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--cream)' }}
            >
              Review
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--cream-dim)' }}>
              Once published, this proposal is visible to all workspace members.
            </p>
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded"
                  style={{ color: 'var(--green)', background: 'var(--green-faint)' }}
                >
                  {CATEGORY_LABEL[form.category]}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: 'var(--cream-dim)', background: 'var(--surface-2)' }}
                >
                  Anonymous
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--cream)' }}>
                {form.framing}
              </p>
              <div
                className="pt-4 flex items-center justify-between text-sm"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--cream-dim)' }}>
                  Threshold: <span style={{ color: 'var(--cream)' }}>{form.thresholdValue} workers</span>
                </span>
                <span style={{ color: 'var(--cream-dim)' }}>
                  Closes in <span style={{ color: 'var(--cream)' }}>{form.deadlineDays} days</span>
                </span>
              </div>
            </div>
            <p className="text-xs text-center mb-8" style={{ color: 'var(--cream-dim)' }}>
              Your identity is not recorded. No one, including Wrkr, can link this proposal to you.
            </p>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex gap-3">
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="w-full py-4 rounded-2xl font-semibold text-sm transition-all disabled:opacity-30"
              style={{ background: 'var(--green)', color: '#111511' }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--green)', color: '#111511' }}
            >
              {submitting ? 'Publishing…' : 'Publish proposal'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
