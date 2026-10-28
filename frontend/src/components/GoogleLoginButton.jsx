import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

export function GoogleLoginButton({ onLogin, onError }) {
  const btnRef = useRef(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const cfg = await fetch('/api/auth/google-client').then((r) => r.json())
      if (!cfg.clientId) {
        setMissing(true)
        return
      }

      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(timer)
            resolve()
          }
        }, 40)
      })
      if (cancelled || !btnRef.current) return

      window.google.accounts.id.initialize({
        client_id: cfg.clientId,
        callback: async (response) => {
          try {
            const res = await api('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential: response.credential }),
            })
            onLogin(res.token, res.user)
          } catch (err) {
            onError(err.message)
          }
        },
      })
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 340,
      })
    }

    init().catch((err) => onError(err.message))
    return () => { cancelled = true }
  }, [onLogin, onError])

  if (missing) {
    return <p className="hint">Google login: set GOOGLE_CLIENT_ID in backend/.env</p>
  }

  return (
    <>
      <div className="auth-divider"><span>or</span></div>
      <div className="google-btn-wrap" ref={btnRef} />
    </>
  )
}
