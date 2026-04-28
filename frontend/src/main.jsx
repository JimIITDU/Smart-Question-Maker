import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Toaster position="top-right" toastOptions={{
      style: { background: '#0F172A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
    }} />
    <App />
  </AuthProvider>
)