import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Grid from './pages/Grid'

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Grid/>} />
      </Routes>
    </Router>
  )
}

export default App
