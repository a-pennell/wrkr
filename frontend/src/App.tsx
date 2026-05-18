import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div style={{ padding: '2rem', color: 'var(--cream)' }}>Wrkr — coming soon</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
