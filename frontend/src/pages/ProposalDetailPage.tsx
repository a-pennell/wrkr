import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Proposal } from '../lib/api'
import { useApi } from '../lib/ApiContext'

const CATEGORY_LABEL: Record<string, string> = {
  compensation: 'Compensation',
  working_conditions: 'Working Conditions',
  other: 'Other',
}

function daysRemaining(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

const DISPLAY: React.CSSProperties = { fontFamily: "'Big Shoulders Display', sans-serif" }

export default function ProposalDetailPage() {
  const { getProposal, commitToProposal, withdrawCommitment, isDemo } = useApi()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!id) return
    try {
      const p = await getProposal(id)
      setProposal(p)
    } catch {
      setError('Could not load proposal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleCommit() {
    if (!id) return
    setActing(true)
    setError('')
    try {
      await commitToProposal(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setActing(false)
    }
  }

  async function handleWithdraw() {
    if (!id) return
    setActing(true)
    setError('')
    try {
      await withdrawCommitment(id)
      await load()
    } catch {
      setError('Could not withdraw.')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--cream-dim)' }}>Loading…</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--cream-dim)' }}>{error || 'Proposal not found.'}</p>
        <button onClick={() => navigate('/')} style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Workspace
        </button>
      </div>
    )
  }

  const framing = (proposal.templateFields as { framing?: string }).framing ?? '—'
  const days = daysRemaining(proposal.deadline)
  const isActivated = proposal.status === 'activated'
  const isExpired = proposal.status === 'expired'
  const isClosed = isActivated || isExpired
  const pct = proposal.thresholdValue > 0 ? Math.min((proposal.commitmentCount / proposal.thresholdValue) * 100, 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...DISPLAY, fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream)' }}>Wrkr</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 500, color: 'var(--cream-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
            Anonymous
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        {/* Back link */}
        <button
          onClick={() => navigate(isDemo ? '/demo' : '/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cream-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '24px 0 22px' }}
        >
          ← Workspace
        </button>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 40 }} />

        {/* Category eyebrow */}
        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.85, marginBottom: 14 }}>
          {CATEGORY_LABEL[proposal.category] ?? proposal.category}
        </div>

        {/* Framing body */}
        <p style={{ fontSize: '0.92rem', lineHeight: 1.68, color: 'var(--cream-dim)', maxWidth: 520, marginBottom: 20 }}>
          {framing}
        </p>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.68, color: 'var(--cream-dim)', maxWidth: 520, marginBottom: 20, paddingTop: 18, borderTop: '1px solid var(--border)', fontStyle: 'italic' }}>
          If this threshold is reached, all committed workers will sign a collective statement.
        </p>

        {/* Threshold block */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', borderLeft: `3px solid ${isActivated ? 'var(--green-glow)' : isExpired ? 'var(--cream-faint)' : 'var(--green)'}`, padding: '28px 28px 24px', margin: '32px 0' }}>
          <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: isExpired ? 'var(--cream-faint)' : 'var(--green)', opacity: 0.75, marginBottom: 14 }}>
            {isActivated ? 'Threshold reached' : isExpired ? 'Final count' : 'Threshold progress'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
            <span style={{ ...DISPLAY, fontWeight: 900, fontSize: '4.8rem', lineHeight: 1, color: isExpired ? 'var(--cream-dim)' : 'var(--green)', textShadow: isExpired ? 'none' : '0 0 32px rgba(82,183,136,0.3)' }}>
              {proposal.commitmentCount}
            </span>
            <span style={{ ...DISPLAY, fontWeight: 500, fontSize: '2.2rem', color: 'var(--border-mid)' }}>/</span>
            <span style={{ ...DISPLAY, fontWeight: 700, fontSize: '2.6rem', color: 'var(--cream-dim)' }}>{proposal.thresholdValue}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', marginLeft: 6, alignSelf: 'flex-end', paddingBottom: 8 }}>workers committed</span>
          </div>
          <div style={{ height: 4, background: 'var(--border-mid)', marginBottom: 12 }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: isExpired ? 'var(--cream-faint)' : isActivated ? 'var(--green-glow)' : 'var(--green)',
              boxShadow: isActivated ? '0 0 16px rgba(82,183,136,0.7)' : isExpired ? 'none' : '0 0 12px rgba(82,183,136,0.5)',
              transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cream-dim)' }}>
            {isActivated && `Activated · ${proposal.commitmentCount} workers committed`}
            {isExpired && `Closed · ${proposal.thresholdValue - proposal.commitmentCount} workers short of threshold`}
            {!isClosed && `${proposal.thresholdValue - proposal.commitmentCount} workers needed · ${days > 0 ? `Closes in ${days} day${days !== 1 ? 's' : ''}` : 'Closing today'}`}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', marginBottom: 16, textAlign: 'center' }}>{error}</p>
        )}

        {/* Actions */}
        {!isClosed && (
          <>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />
            <p style={{ fontSize: '0.78rem', color: 'var(--cream-dim)', lineHeight: 1.6, marginBottom: 18 }}>
              If {proposal.thresholdValue} workers commit, all commitments activate simultaneously — no one acts alone.<br />
              Your identity is never revealed, before or after threshold.
            </p>

            {proposal.userCommitted ? (
              <>
                <div style={{ background: 'var(--green-faint)', border: '1px solid var(--border-mid)', borderLeft: '3px solid var(--green)', padding: '20px 22px', marginBottom: 14 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6 }}>
                    ✓ You've committed
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--cream-dim)', lineHeight: 1.55 }}>
                    Your commitment is recorded anonymously. If {proposal.thresholdValue} workers commit, you'll all be notified simultaneously — no one acts alone.
                  </div>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={acting}
                  style={{ display: 'block', textAlign: 'center', width: '100%', fontSize: '0.72rem', color: 'var(--cream-faint)', background: 'none', border: 'none', cursor: acting ? 'not-allowed' : 'pointer', padding: '10px 0', textDecoration: 'underline', textUnderlineOffset: 3, opacity: acting ? 0.5 : 1 }}
                >
                  {acting ? 'Withdrawing…' : 'Withdraw my commitment'}
                </button>
              </>
            ) : (
              <button
                onClick={handleCommit}
                disabled={acting}
                style={{
                  width: '100%',
                  background: 'var(--green)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '18px 24px',
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: acting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: acting ? 0.6 : 1,
                  marginBottom: 14,
                  transition: 'background 0.15s',
                }}
              >
                <span>{acting ? 'Committing…' : `Commit if ${proposal.thresholdValue} agree`}</span>
                {!acting && <span style={{ fontSize: '1.3rem', fontWeight: 400 }}>→</span>}
              </button>
            )}
            <p style={{ fontSize: '0.7rem', color: 'var(--cream-faint)', fontStyle: 'italic', textAlign: 'center' }}>
              You can withdraw any time before the threshold is reached.
            </p>
          </>
        )}

        {isActivated && (
          <>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', borderLeft: '3px solid var(--green)', padding: '22px 22px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 8 }}>
                ✓ Threshold reached
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--cream-dim)', lineHeight: 1.55 }}>
                {proposal.commitmentCount} workers committed and the collective statement was generated.
              </div>
            </div>
          </>
        )}

        {isExpired && (
          <>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 24 }} />
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', padding: '20px 22px', marginBottom: 14 }}>
              <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 8 }}>
                What now
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--cream-dim)', lineHeight: 1.55, marginBottom: 16 }}>
                This proposal didn't reach its threshold — no action was taken and no one's commitment was exposed. The concern is still valid. Anyone can start a new proposal based on this one.
              </div>
              <button
                onClick={() => navigate('/create')}
                style={{ width: '100%', background: 'transparent', color: 'var(--cream-dim)', border: '1px solid var(--border-mid)', padding: '15px 22px', fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>Start a similar proposal</span><span>→</span>
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: 28, fontSize: '0.75rem', color: 'var(--cream-faint)', paddingTop: 24, borderTop: '1px solid var(--border)', marginBottom: 48 }}>
          {isClosed ? 'Proposal closed' : 'Proposal closes'} &nbsp;·&nbsp; Created anonymously
        </div>
      </div>
    </div>
  )
}
