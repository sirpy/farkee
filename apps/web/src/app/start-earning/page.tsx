"use client"

import { useMiniApp } from "@/contexts/miniapp-context";
import { useState, useEffect, useRef } from "react"
import QRCode from 'react-qr-code';

export default function StartEarningPage() {
  const [loading, setLoading] = useState(false)
  const [deeplink, setDeeplink] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const autoOpenedRef = useRef(false)
  const context = useMiniApp()

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
    try {

      // send public key to our server api which will sign the EIP-712 payload and call Farcaster API
      const res = await fetch("/api/signed-key-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed creating signed key request")
      const { token, deeplinkUrl } = json.result.signedKeyRequest
      setToken(token)
      setDeeplink(deeplinkUrl)
      setState("pending")

      // start polling Farcaster client API for status
      pollStatus(token)
    } catch (err) {
      console.error(err)
      alert(String(err))
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

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-4">Start Earning</h1>

      <p className="mb-4">Create a Farcaster signer so your app can post on behalf of the user.</p>

      <div className="space-y-4">
        <button
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60"
          onClick={createSignedKeyRequest}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Signer Request"}
        </button>

        {deeplink && (
          <div>
            <div className="text-sm font-medium">Open this deeplink on a device with the Farcaster client</div>

            {/* Mobile: automatically attempts to open the deeplink. Provide a fallback button.
                Desktop/web: render a QR code so user can scan the deeplink with their phone. */}
            {isMobile ? (
              <div className="space-y-2">
                <div className="text-xs break-all">{deeplink}</div>
                <div className="text-sm text-muted-foreground">If the Farcaster app didn't open automatically, tap below:</div>
                <a
                  href={deeplink}
                  className="inline-block px-3 py-1 rounded bg-primary text-white"
                  onClick={() => { /* explicit link fallback */ }}
                >
                  Open on this device
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-4 items-start">
                <div className="p-2 bg-white rounded">
                  <QRCode value={deeplink} />
                </div>
                <div className="text-sm">Scan this QR code with a phone that has the Farcaster app to approve the signer request.</div>
                <div className="text-xs break-all">{deeplink}</div>
              </div>
            )}

            <div className="mt-2">Token: {token}</div>
            <div className="mt-2">State: {state}</div>
          </div>
        )}
      </div>
    </div>
  )
}
