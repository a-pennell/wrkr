const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'
const DEMO = `${BASE}/demo`

function sessionId(): string {
  let id = localStorage.getItem('wrkr_demo_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('wrkr_demo_session', id)
  }
  return `demo-${id}`
}

function headers(): HeadersInit {
  return { 'Content-Type': 'application/json', 'x-session-id': sessionId() }
}

export async function getWorkspace() {
  const res = await fetch(`${DEMO}/workspace`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load workspace')
  return res.json()
}

export async function getProposal(id: string) {
  const res = await fetch(`${DEMO}/proposals/${id}`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load proposal')
  return res.json()
}

export async function createProposal(): Promise<{ id: string }> {
  throw new Error('Cannot create proposals in demo mode')
}

export async function commitToProposal(id: string) {
  const res = await fetch(`${DEMO}/proposals/${id}/commit`, { method: 'POST', headers: headers(), body: '{}' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to commit')
  }
  return res.json()
}

export async function withdrawCommitment(id: string) {
  const res = await fetch(`${DEMO}/proposals/${id}/commit`, { method: 'DELETE', headers: headers(), body: '{}' })
  if (!res.ok) throw new Error('Failed to withdraw')
  return res.json()
}

export const isDemo = true
