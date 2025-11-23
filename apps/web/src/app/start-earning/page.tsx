"use client"

import { useMiniApp } from "@/contexts/miniapp-context";
import { useState, useEffect, useRef } from "react"
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

// helper to render small status badge

export default function StartEarningPage() {
  const [loading, setLoading] = useState(false)
  const [deeplink, setDeeplink] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const autoOpenedRef = useRef(false)
  const context = useMiniApp()
  const [signedRequest, setSignedRequest] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  

  const router = useRouter()

  // preset defaults if none exist
  const PRESET_TYPES = [
    { id: 'preset-1', name: 'Roast Me', price: '5 G$', policy: 'Short roast, no personal threats' },
    { id: 'preset-2', name: 'Shilling', price: '3 G$', policy: 'Promote one token/URL, no spam' },
    { id: 'preset-3', name: 'Sponsor', price: '10 G$', policy: 'Longer sponsor message, includes link' },
    { id: 'preset-4', name: 'Q/A Shoutout', price: '4 G$', policy: 'Answer a question or shout a user' },
  ]

  const displayedTypes = PRESET_TYPES

  const selectType = (t: { id: string; name: string; price: string; policy: string }) => {
    // navigate to create flow with type info in query
    const qs = `?type=${encodeURIComponent(t.name)}&policy=${encodeURIComponent(t.policy)}`
    router.push(`/start-earning/create${qs}`)
  }

  const renderStatusBadge = (s: string | null) => {
    if (!s) return null
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const cls = map[s] || 'bg-gray-100 text-gray-800'
    return <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${cls}`}>{s}</span>
  }

  console.log({context})
  useEffect(() => {
    // run only on client
    if (typeof navigator === "undefined") return
    const ua = navigator.userAgent || ""
    const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)
    setIsMobile(mobile)
  }, [])

  const createSignedKeyRequest = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      // call the server to create a signed key request
      const res = await fetch("/api/signed-key-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed creating signed key request")
      const skReq = json.result?.signedKeyRequest
      const { token, deeplinkUrl } = skReq
      setSignedRequest(skReq)
      setToken(token)
      setDeeplink(deeplinkUrl)
      setState("pending")

      // start polling Farcaster client API for status
      pollStatus(token)
    } catch (err) {
      console.error(err)
      setErrorMsg(String(err))
    } finally {
      setLoading(false)
    }
  }

  const pollStatus = async (token: string) => {
    // basic polling every 2s until completed (stop after some attempts)
    let attempts = 0
    while (attempts < 300) {
      attempts++
      await new Promise((r) => setTimeout(r, 2000))
      try {
        const res = await fetch(`https://api.farcaster.xyz/v2/signed-key-request?token=${encodeURIComponent(token)}`)
        const json = await res.json()
        const sk = json.result?.signedKeyRequest
        if (sk) {
          setSignedRequest(sk)
          setState(sk.state)
          if (sk.state === "completed" || sk.state === "approved") {
            break
          }
        }
      } catch (err) {
        console.error("poll error", err)
      }
    }
  }

  // Attempt to open deeplink automatically on mobile once it's available.
  useEffect(() => {
    if (!deeplink || isMobile === null) return
    if (isMobile && !autoOpenedRef.current) {
      // try to open the farcaster deeplink on mobile
      autoOpenedRef.current = true
      // small delay to allow UI to update before redirecting
      setTimeout(() => {
        try {
          window.location.href = deeplink
        } catch {
          // ignore; fallback UI provided below
        }
      }, 300)
    }
  }, [deeplink, isMobile])

  const copy = async (text: string | null) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard')
    } catch {
      // fallback
    }
  }

  const reset = () => {
    setDeeplink(null)
    setToken(null)
    setState(null)
    setSignedRequest(null)
    autoOpenedRef.current = false
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Start Earning</h1>

        <p className="mb-4 text-muted-foreground">Create a Farcaster signer so your app can post on behalf of the user.</p>

        <div className="space-y-4">
          {/* Selection grid: choose a preset or your defined commission type */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            {displayedTypes.map((t) => (
              <Card key={t.id} className="p-4 cursor-pointer hover:shadow-md" onClick={() => selectType(t)}>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.policy}</div>
              </Card>
            ))}
          </div>
          {/* Removed commission-editing UI per request; presets are displayed above for selection. */}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{errorMsg}</div>
          )}

          {signedRequest && (
            <div className="p-4 border rounded space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">Status</div>
                  {renderStatusBadge(state)}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-sm text-muted-foreground" onClick={() => copy(signedRequest.deeplinkUrl)}>Copy Deeplink</button>
                  <button className="text-sm text-muted-foreground" onClick={() => copy(signedRequest.token)}>Copy Token</button>
                  <button className="text-sm text-muted-foreground" onClick={reset}>Reset</button>
                </div>
              </div>

              <div>
                {isMobile ? (
                  <div className="space-y-2">
                    <div className="text-xs break-all">{signedRequest.deeplinkUrl}</div>
                    <div className="text-sm text-muted-foreground">If the Farcaster app didn&apos;t open automatically, tap below:</div>
                    <a href={signedRequest.deeplinkUrl} className="inline-block px-3 py-1 rounded bg-primary text-white">Open on this device</a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 items-start">
                    <div className="p-2 bg-white rounded">
                      <QRCode value={signedRequest.deeplinkUrl} />
                    </div>
                    <div className="text-sm">Scan this QR code with a phone that has the Farcaster app to approve the signer request.</div>
                    <div className="text-xs break-all">{signedRequest.deeplinkUrl}</div>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">Token: {signedRequest.token}</div>

              {state === 'completed' || state === 'approved' ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium">Signer approved</div>
                  <div className="text-sm text-muted-foreground mt-1">Signed key request is completed. The Farcaster client approved the signer.</div>
                  {signedRequest.ed25519PublicKey && (
                    <div className="mt-2 text-xs break-all">Ed25519 public key: {signedRequest.ed25519PublicKey}</div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
