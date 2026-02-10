import { useState } from 'react'
import Sidebar from './views/layout/Sidebar'
import GoalCanvas from './views/canvas/GoalCanvas'
import { GoalProvider } from './context/GoalContext'

import SettingsModal from './views/SettingsModal'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [autoLayoutFn, setAutoLayoutFn] = useState(null)

  const handleSelectedNodeChange = (node) => {
    setSelectedNode(node)
  }

  const handleAutoLayoutReady = (layoutFn) => {
    setAutoLayoutFn(() => layoutFn)
  }

  return (
    <GoalProvider>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Sidebar 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          selectedNode={selectedNode}
          onAutoLayout={autoLayoutFn}
        />
        <GoalCanvas 
          onSelectedNodeChange={handleSelectedNodeChange}
          onAutoLayoutReady={handleAutoLayoutReady}
        />
      </div>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </GoalProvider>
  )
}

export default App
