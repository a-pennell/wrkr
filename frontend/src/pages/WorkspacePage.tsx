import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Proposal, Workspace } from '../lib/api'
import { useApi } from '../lib/ApiContext'

const CATEGORY_LABEL: Record<string, string> = {
  compensation: 'Compensation',
  working_conditions: 'Working Conditions',
  other: 'Other',
}

function daysRemaining(deadline: string) {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

function ProposalItem({ proposal, isDemo }: { proposal: Proposal; isDemo: boolean }) {
  const navigate = useNavigate()
  const days = daysRemaining(proposal.deadline)
  const isActivated = proposal.status === 'activated'
  const isExpired = proposal.status === 'expired'
  const isActive = proposal.status === 'active'
  const pct = proposal.thresholdValue > 0 ? Math.min((proposal.commitmentCount / proposal.thresholdValue) * 100, 100) : 0
  const framing = (proposal.templateFields as { framing?: string }).framing ?? '—'

  return (
    <div
      onClick={() => navigate(isDemo ? `/demo/proposal/${proposal.id}` : `/proposal/${proposal.id}`)}
      style={{ borderTop: '1px solid var(--border)', padding: '28px 0', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.querySelector('.framing-text') as HTMLElement | null)?.style && ((e.currentTarget.querySelector('.framing-text') as HTMLElement).style.color = 'var(--green-glow)')}
      onMouseLeave={e => (e.currentTarget.querySelector('.framing-text') as HTMLElement | null)?.style && ((e.currentTarget.querySelector('.framing-text') as HTMLElement).style.color = 'var(--cream)')}
    >
      <div style={{ fontSize: '0.63rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--green)', opacity: 0.8, marginBottom: 7 }}>
        {CATEGORY_LABEL[proposal.category] ?? proposal.category}
      </div>
      <div
        className="framing-text"
        style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1.45rem', lineHeight: 1.12, color: 'var(--cream)', marginBottom: 8, transition: 'color 0.15s', textTransform: 'uppercase' }}
      >
        {framing.split(' ').slice(0, 5).join(' ')}
      </div>
      <div style={{ fontSize: '0.86rem', color: 'var(--cream-dim)', lineHeight: 1.6, maxWidth: 520, marginBottom: 20 }}>
        {framing}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 3, background: 'var(--border-mid)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: isActivated ? 'var(--green-glow)' : 'var(--green)', boxShadow: isActivated ? '0 0 12px rgba(82,183,136,0.6)' : '0 0 8px rgba(82,183,136,0.4)', transition: 'width 0.7s' }} />
        </div>
        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: 'var(--cream)', whiteSpace: 'nowrap', minWidth: 68, textAlign: 'right' }}>
          {proposal.commitmentCount} <span style={{ color: 'var(--cream-dim)', fontWeight: 500 }}>/ {proposal.thresholdValue}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--cream-faint)', marginTop: 10 }}>
        {isActivated && 'Threshold reached'}
        {isExpired && 'Closed · Did not reach threshold'}
        {isActive && (days > 0 ? `Closes in ${days} day${days !== 1 ? 's' : ''}` : 'Closing today')}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const { getWorkspace, isDemo } = useApi()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getWorkspace().then(setWorkspace).catch(() => setError('Could not load workspace.'))
  }, [])

  const active = workspace?.proposals.filter(p => p.status === 'active') ?? []
  const closed = workspace?.proposals.filter(p => p.status !== 'active') ?? []
  const hasProposals = active.length > 0 || closed.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '22px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '1.05rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cream)' }}>
            Wrkr
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 500, color: 'var(--cream-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
            Anonymous{workspace ? ` · ${workspace.memberCount} members` : ''}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        {error && <p style={{ padding: '24px 0', fontSize: '0.88rem', color: 'var(--cream-dim)' }}>{error}</p>}
        {!workspace && !error && <p style={{ padding: '24px 0', fontSize: '0.88rem', color: 'var(--cream-dim)' }}>Loading…</p>}

        {workspace && !hasProposals && (
          <>
            <div style={{ padding: '48px 0 40px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12 }}>Your workspace</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(3.2rem, 9vw, 5.2rem)', lineHeight: 0.92, textTransform: 'uppercase', color: 'var(--cream)' }}>
                Your<br />Workspace
              </div>
              <div style={{ marginTop: 20, fontSize: '0.82rem', color: 'var(--cream-dim)' }}>
                <strong style={{ color: 'var(--cream)', fontWeight: 600 }}>{workspace.memberCount}</strong> verified members
              </div>
            </div>
            <div style={{ paddingTop: 56, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(6rem, 20vw, 10rem)', lineHeight: 1, color: 'var(--surface-2)', userSelect: 'none', marginBottom: 4 }}>0</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--cream-faint)', marginBottom: 16 }}>Active proposals</div>
              <p style={{ fontSize: '1rem', color: 'var(--cream-dim)', lineHeight: 1.65, maxWidth: 400, marginBottom: 40 }}>
                No one has started a proposal yet. You can be the first.
              </p>
              <div style={{ display: 'flex', gap: 12, paddingBottom: 48 }}>
                <button
                  onClick={() => navigate('/create')}
                  style={{ background: 'var(--green)', color: 'var(--bg)', border: 'none', padding: '15px 24px', fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  + Start a proposal
                </button>
              </div>
            </div>
          </>
        )}

        {workspace && hasProposals && (
          <>
            <div style={{ padding: '48px 0 36px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 12 }}>Your workspace</div>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(3.2rem, 9vw, 5.2rem)', lineHeight: 0.92, textTransform: 'uppercase', color: 'var(--cream)' }}>
                Your<br />Workspace
              </div>
              <div style={{ marginTop: 20, fontSize: '0.82rem', color: 'var(--cream-dim)' }}>
                <strong style={{ color: 'var(--cream)', fontWeight: 600 }}>{workspace.memberCount}</strong> verified members
                {active.length > 0 && <> &nbsp;·&nbsp; <strong style={{ color: 'var(--cream)', fontWeight: 600 }}>{active.length}</strong> active proposal{active.length !== 1 ? 's' : ''}</>}
              </div>
            </div>

            {active.length > 0 && (
              <div>
                <div style={{ paddingTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>Active proposals</span>
                  <button onClick={() => navigate('/create')} style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    + Start a proposal
                  </button>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  {active.map(p => <ProposalItem key={p.id} proposal={p} isDemo={isDemo} />)}
                </div>
              </div>
            )}

            {closed.length > 0 && (
              <div>
                <div style={{ paddingTop: 22, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>Closed</span>
                  {active.length === 0 && (
                    <button onClick={() => navigate('/create')} style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      + Start a proposal
                    </button>
                  )}
                </div>
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  {closed.map(p => <ProposalItem key={p.id} proposal={p} isDemo={isDemo} />)}
                </div>
              </div>
            )}

            <div style={{ padding: '28px 0 40px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--cream-faint)', fontStyle: 'italic' }}>You are anonymous. Your identity is never stored.</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
