import { useState } from 'react'
import Sidebar from './views/layout/Sidebar'
import GoalCanvas from './views/canvas/GoalCanvas'
import { GoalProvider } from './context/GoalContext'

import SettingsModal from './views/SettingsModal'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <GoalProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <GoalCanvas />
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </GoalProvider>
  )
}

export default App
