import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WorkspacePage from './pages/WorkspacePage'
import ProposalDetailPage from './pages/ProposalDetailPage'
import CreateProposalPage from './pages/CreateProposalPage'
import { ApiProvider } from './lib/ApiContext'
import DevNav from './components/DevNav'
import * as realApi from './lib/api'
import * as demoApi from './lib/demoApi'

const realApiModule = { ...realApi, isDemo: false }
const demoApiModule = { ...demoApi, isDemo: true }

function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider value={demoApiModule}>
      {children}
      <DevNav />
    </ApiProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApiProvider value={realApiModule}><WorkspacePage /></ApiProvider>} />
        <Route path="/proposal/:id" element={<ApiProvider value={realApiModule}><ProposalDetailPage /></ApiProvider>} />
        <Route path="/create" element={<CreateProposalPage />} />

        <Route path="/demo" element={<DemoShell><WorkspacePage /></DemoShell>} />
        <Route path="/demo/proposal/:id" element={<DemoShell><ProposalDetailPage /></DemoShell>} />
      </Routes>
    </BrowserRouter>
  )
}
