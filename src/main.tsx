import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HotkeyProvider, HotkeyRegistry } from './index'

const hotkeyRegistry = new HotkeyRegistry(document)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HotkeyProvider registry={hotkeyRegistry}>
      <App />
    </HotkeyProvider>
  </StrictMode>,
)
