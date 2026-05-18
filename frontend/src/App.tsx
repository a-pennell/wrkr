import { BrowserRouter, Route, Routes } from 'react-router-dom'
import WorkspacePage from './pages/WorkspacePage'
import ProposalDetailPage from './pages/ProposalDetailPage'
import CreateProposalPage from './pages/CreateProposalPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/proposal/:id" element={<ProposalDetailPage />} />
        <Route path="/create" element={<CreateProposalPage />} />
      </Routes>
    </BrowserRouter>
  )
}
