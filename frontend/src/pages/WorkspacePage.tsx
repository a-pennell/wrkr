import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkspace, type Proposal, type Workspace } from '../lib/api'

const CATEGORY_LABEL: Record<string, string> = {
  compensation: 'Compensation',
  working_conditions: 'Working Conditions',
  other: 'Other',
}

function daysRemaining(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
      <div
        className="h-1 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: 'var(--green)' }}
      />
    </div>
  )
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate()
  const days = daysRemaining(proposal.deadline)
  const isActive = proposal.status === 'active'
  const isActivated = proposal.status === 'activated'
  const isExpired = proposal.status === 'expired'

  return (
    <button
      onClick={() => navigate(`/proposal/${proposal.id}`)}
      className="w-full text-left rounded-2xl p-5 transition-colors"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded"
          style={{ color: 'var(--green)', background: 'var(--green-faint)' }}
        >
          {CATEGORY_LABEL[proposal.category] ?? proposal.category}
        </span>
        {isActivated && (
          <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>
            Threshold reached
          </span>
        )}
        {isExpired && (
          <span className="text-xs font-medium" style={{ color: 'var(--cream-dim)' }}>
            Expired
          </span>
        )}
        {isActive && (
          <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
            {days}d left
          </span>
        )}
      </div>

      <p
        className="text-sm leading-relaxed mb-4 line-clamp-2"
        style={{ color: 'var(--cream)' }}
      >
        {(proposal.templateFields as { framing?: string }).framing ?? '—'}
      </p>

      <ProgressBar value={proposal.commitmentCount} max={proposal.thresholdValue} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
          {proposal.commitmentCount} / {proposal.thresholdValue} committed
        </span>
      </div>
    </button>
  )
}

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getWorkspace().then(setWorkspace).catch(() => setError('Could not load workspace.'))
  }, [])

  const active = workspace?.proposals.filter(p => p.status === 'active') ?? []
  const closed = workspace?.proposals.filter(p => p.status !== 'active') ?? []

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-7 h-14"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, color: 'var(--cream)' }}
        >
          WRKR
        </span>
        {workspace && (
          <span className="text-xs" style={{ color: 'var(--cream-dim)' }}>
            {workspace.memberCount} verified members
          </span>
        )}
      </div>

      <div className="max-w-[720px] mx-auto px-7 py-8">
        {error && (
          <p className="text-sm mb-6" style={{ color: 'var(--cream-dim)' }}>{error}</p>
        )}

        {!workspace && !error && (
          <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>Loading…</p>
        )}

        {workspace && active.length === 0 && closed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <p
              className="text-8xl font-black tracking-tighter"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", color: 'var(--border)' }}
            >
              0
            </p>
            <p className="text-sm" style={{ color: 'var(--cream-dim)' }}>
              No active proposals yet.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--green)', color: '#111511' }}
            >
              Start a proposal
            </button>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--cream-dim)' }}
            >
              Active
            </h2>
            <div className="flex flex-col gap-3">
              {active.map(p => <ProposalCard key={p.id} proposal={p} />)}
            </div>
          </section>
        )}

        {closed.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--cream-dim)' }}
            >
              Closed
            </h2>
            <div className="flex flex-col gap-3">
              {closed.map(p => <ProposalCard key={p.id} proposal={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* FAB */}
      {workspace && (active.length > 0 || closed.length > 0) && (
        <button
          onClick={() => navigate('/create')}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-2xl font-bold shadow-lg transition-opacity hover:opacity-80 flex items-center justify-center"
          style={{ background: 'var(--green)', color: '#111511' }}
        >
          +
        </button>
      )}
    </div>
  )
}
