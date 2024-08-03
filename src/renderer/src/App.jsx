import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import FlashArea from './FlashArea'

function App() {
  return (
    <Routes>
      <Route path="/" exact element={<Home />} />
      <Route path="/flash" exact element={<FlashArea />} />
    </Routes>
  )
}

export default App
