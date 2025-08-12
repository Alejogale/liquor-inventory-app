'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  title?: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (msg: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, ...msg }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-[360px] rounded-lg px-4 py-3 shadow-lg border ${
              t.variant === 'success' ? 'bg-green-600/90 text-white border-green-400' :
              t.variant === 'error' ? 'bg-red-600/90 text-white border-red-400' :
              'bg-slate-800/90 text-white border-slate-600'
            }`}
          >
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div className="text-sm opacity-95">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}