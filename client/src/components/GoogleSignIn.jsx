import { useEffect, useRef } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

let scriptPromise = null
function loadGis() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Google sign-in'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Renders Google's official Sign in with Google button.
 * Calls onCredential(idToken) with the Google ID token on success.
 * Renders nothing when VITE_GOOGLE_CLIENT_ID is not configured.
 */
export default function GoogleSignIn({ text = 'signin_with', onCredential, onError }) {
  const divRef = useRef(null)
  const cbRef = useRef({ onCredential, onError })
  cbRef.current = { onCredential, onError }

  useEffect(() => {
    if (!CLIENT_ID || !divRef.current) return
    let cancelled = false
    loadGis()
      .then(() => {
        if (cancelled || !divRef.current) return
        divRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => {
            if (resp?.credential) cbRef.current.onCredential(resp.credential)
            else cbRef.current.onError?.(new Error('Google did not return a credential'))
          },
          auto_select: false,
        })
        window.google.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text,
          shape: 'pill',
        })
      })
      .catch((err) => cbRef.current.onError?.(err))
    return () => {
      cancelled = true
    }
  }, [text])

  if (!CLIENT_ID) return null
  return <div ref={divRef} className="flex justify-center" />
}
