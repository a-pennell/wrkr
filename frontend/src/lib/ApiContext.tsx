import { createContext, useContext } from 'react'
import type { Proposal, Workspace } from './api'

export interface ApiModule {
  getWorkspace(): Promise<Workspace>
  getProposal(id: string): Promise<Proposal>
  createProposal(data: {
    category: string
    templateFields: { framing: string }
    thresholdType: string
    thresholdValue: number
    deadlineDays: number
  }): Promise<{ id: string }>
  commitToProposal(id: string): Promise<unknown>
  withdrawCommitment(id: string): Promise<unknown>
  isDemo: boolean
}

const ApiContext = createContext<ApiModule | null>(null)

export function useApi(): ApiModule {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi must be used within ApiProvider')
  return ctx
}

export function ApiProvider({ value, children }: { value: ApiModule; children: React.ReactNode }) {
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
