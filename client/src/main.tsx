import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AuthContext from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Initialize Catppuccin theme variant on load.
// Priority: localStorage 'theme' -> system preference
const applyInitialTheme = () => {
  try {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('theme-catppuccin-dark')
      // also add Tailwind's `dark` class so `dark:` utilities work
      document.documentElement.classList.add('dark')
    }
  } catch {
    // ignore
  }
}

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContext>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthContext>
  </StrictMode>,
)
