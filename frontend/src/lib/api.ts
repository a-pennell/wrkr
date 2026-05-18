const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

function sessionId(): string {
  let id = localStorage.getItem('wrkr_session')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('wrkr_session', id)
  }
  return id
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-session-id': sessionId(),
  }
}

export interface Proposal {
  id: string
  category: string
  templateFields: { framing: string }
  thresholdType: string
  thresholdValue: number
  deadline: string
  status: 'pending' | 'active' | 'activated' | 'expired'
  activatedAt: string | null
  createdAt: string
  commitmentCount: number
  userCommitted?: boolean
}

export interface Workspace {
  workspaceId: string
  memberCount: number
  proposals: Proposal[]
}

export async function getWorkspace(): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspace`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load workspace')
  return res.json()
}

export async function getProposal(id: string): Promise<Proposal> {
  const res = await fetch(`${BASE}/proposals/${id}`, { headers: headers() })
  if (!res.ok) throw new Error('Failed to load proposal')
  return res.json()
}

export async function createProposal(data: {
  category: string
  templateFields: { framing: string }
  thresholdType: string
  thresholdValue: number
  deadlineDays: number
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/proposals`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create proposal')
  return res.json()
}

export async function commitToProposal(id: string) {
  const res = await fetch(`${BASE}/proposals/${id}/commit`, {
    method: 'POST',
    headers: headers(),
    body: '{}',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to commit')
  }
  return res.json()
}

export async function withdrawCommitment(id: string) {
  const res = await fetch(`${BASE}/proposals/${id}/commit`, {
    method: 'DELETE',
    headers: headers(),
    body: '{}',
  })
  if (!res.ok) throw new Error('Failed to withdraw')
  return res.json()
}
