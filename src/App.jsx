import { useState } from 'react'
import Sidebar from './views/layout/Sidebar'
import GoalCanvas from './views/canvas/GoalCanvas'
import { GoalProvider } from './context/GoalContext'

function App() {
  return (
    <GoalProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <GoalCanvas />
      </div>
    </GoalProvider>
  )
}

export default App
