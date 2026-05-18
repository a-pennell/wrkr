import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProposal, commitToProposal, withdrawCommitment, type Proposal } from '../lib/api'

const CATEGORY_LABEL: Record<string, string> = {
  compensation: 'Compensation',
  working_conditions: 'Working Conditions',
  other: 'Other',
}

function daysRemaining(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

function ProgressBar({ value, max, activated }: { value: number; max: number; activated: boolean }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: activated ? 'var(--green-glow)' : 'var(--green)',
            boxShadow: activated ? '0 0 12px var(--green-glow)' : 'none',
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-sm">
        <span style={{ color: 'var(--cream-dim)' }}>
          <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{value}</span>
          {' / '}
          <span style={{ color: 'var(--cream-dim)' }}>{max} committed</span>
        </span>
        <span style={{ color: 'var(--cream-dim)' }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  )
}

export default function ProposalDetailPage() {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>Loading…</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>{error || 'Proposal not found.'}</p>
        <button onClick={() => navigate('/')} className="text-sm" style={{ color: 'var(--green)' }}>
          Back to workspace
        </button>
      </div>
    )
  }

  const days = daysRemaining(proposal.deadline)
  const isActivated = proposal.status === 'activated'
  const isExpired = proposal.status === 'expired'
  const isClosed = isActivated || isExpired

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-10 flex items-center h-14 px-7"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-sm transition-opacity hover:opacity-60"
          style={{ color: 'var(--cream-dim)' }}
        >
          ← Proposals
        </button>
      </div>

      <div className="max-w-[720px] mx-auto px-7 py-8">
        {/* Category + status */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded"
            style={{ color: 'var(--green)', background: 'var(--green-faint)' }}
          >
            {CATEGORY_LABEL[proposal.category] ?? proposal.category}
          </span>
          {isActivated && (
            <span
              className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded"
              style={{ color: '#111511', background: 'var(--green-glow)' }}
            >
              Threshold reached
            </span>
          )}
          {isExpired && (
            <span
              className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded"
              style={{ color: 'var(--cream-dim)', background: 'var(--surface-2)' }}
            >
              Expired
            </span>
          )}
        </div>

        {/* Framing */}
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--cream)' }}
        >
          {(proposal.templateFields as { framing?: string }).framing ?? '—'}
        </p>

        {/* Sign-if block */}
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <span className="font-semibold uppercase tracking-widest text-xs" style={{ color: 'var(--cream-dim)' }}>
            Sign if:{' '}
          </span>
          <span style={{ color: 'var(--cream)' }}>
            {proposal.thresholdValue} workers commit to this
          </span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar
            value={proposal.commitmentCount}
            max={proposal.thresholdValue}
            activated={isActivated}
          />
        </div>

        {/* Deadline */}
        {!isClosed && (
          <p className="text-sm mb-8" style={{ color: 'var(--cream-dim)' }}>
            {days > 0 ? `${days} day${days !== 1 ? 's' : ''} remaining` : 'Closing today'}
          </p>
        )}

        {/* Activated state */}
        {isActivated && (
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: 'var(--green-faint)', border: '1px solid var(--green-dim)' }}
          >
            <p className="text-2xl mb-2" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--green-glow)' }}>
              Threshold reached
            </p>
            <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
              {proposal.commitmentCount} workers committed. A collective statement has been generated.
            </p>
          </div>
        )}

        {/* Expired state */}
        {isExpired && (
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
              This proposal closed without reaching its threshold.
              {' '}{proposal.commitmentCount} of {proposal.thresholdValue} workers committed.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: 'var(--cream-dim)' }}>{error}</p>
        )}

        {/* Commit / withdraw actions */}
        {!isClosed && (
          <>
            {proposal.userCommitted ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-full rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: 'var(--green-faint)', border: '1px solid var(--green-dim)' }}
                >
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>
                      You've committed to this
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--cream-dim)' }}>
                      Once the threshold is reached, your commitment is locked.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={acting}
                  className="text-sm transition-opacity hover:opacity-60 disabled:opacity-30"
                  style={{ color: 'var(--cream-dim)' }}
                >
                  {acting ? 'Withdrawing…' : 'Withdraw my commitment'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleCommit}
                disabled={acting}
                className="w-full py-4 rounded-2xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: 'var(--green)', color: '#111511' }}
              >
                {acting ? 'Committing…' : 'I commit to this'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
