"use client"

import { useState } from "react"
import { useFarkeeApi } from "@/hooks/use-farkee-api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function BuyModal({ space, onClose, onSuccess }: { space: any; onClose: () => void; onSuccess: (res: any) => void }) {
  const [text, setText] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = useFarkeeApi()

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      // Try wallet-based purchase via buySpace first. If that fails, fall back to manual txHash submission.
      try {
        const fid = Number(space.fid)
        const price = Number(space.price)
        const spaceType = Number(space.spaceType ?? space.type ?? 0)
        const tx = await api.buySpace(fid, price, spaceType, text)
        onSuccess({ txHash: tx })
        onClose()
        return
      } catch (walletErr) {
        // wallet flow not available or failed — continue to manual flow
      }

      const res = await fetch('/api/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, txHash }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Request failed')
      onSuccess(json)
      onClose()
    } catch (err: any) {
      setError(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-w-xl w-full">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Buy slot on {space?.owner || 'Unknown'}</h3>
          <p className="text-sm text-muted-foreground mb-4">Price: {space?.price || '—'}</p>

          <label className="block text-sm font-medium">Transaction hash (required)</label>
          <input
            className="w-full border px-3 py-2 rounded mt-1 mb-3"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x..."
          />

          <label className="block text-sm font-medium">Cast text</label>
          <textarea
            className="w-full border px-3 py-2 rounded mt-1 mb-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Write the cast text the buyer submitted on-chain"
          />

          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={loading || !txHash || !text}>
              {loading ? 'Posting...' : 'Submit for Validation'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default BuyModal
