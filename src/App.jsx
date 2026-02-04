import { useState } from 'react'
import Sidebar from './views/layout/Sidebar'
import GoalCanvas from './views/canvas/GoalCanvas'

function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <GoalCanvas />
    </div>
  )
}

export default App
