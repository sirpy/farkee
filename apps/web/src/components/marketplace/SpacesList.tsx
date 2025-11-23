"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BuyModal from "./BuyModal"
import { useFarkeeApi } from "@/hooks/use-farkee-api"

const SAMPLE_SPACES = [
  { fid: '1001', owner: "@alice", price: "5", spaceType: 0, type: 'Roast' },
  { fid: '2002', owner: "@bob", price: "3", spaceType: 1, type: 'Shill' },
  { fid: '3003', owner: "@carol", price: "10", spaceType: 2, type: 'Sponsor' },
]

export function SpacesList() {
  const api = useFarkeeApi()
  const [selected, setSelected] = useState<any | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [spaces, setSpaces] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.getAdSpaces()
      .then((s) => {
        if (!mounted) return
        setSpaces(s)
      })
      .catch((err) => {
        if (!mounted) return
        setError(String(err?.message || err))
        setSpaces(SAMPLE_SPACES)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="text-center">Loading spaces…</div>
  if (error) return <div className="text-center text-red-600">Error: {error}</div>
  const list = spaces && spaces.length ? spaces : SAMPLE_SPACES

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s: any) => (
        <Card key={s.fid} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Owner</div>
              <div className="font-medium">{s.owner}</div>
              <div className="mt-2 text-xs inline-block px-2 py-1 rounded bg-gray-100 text-xs">Type: {s.type ?? s.spaceType}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold text-lg">{s.price ? `${s.price} G$` : '—'}</div>
              <div className="mt-3">
                <Button size="sm" onClick={() => setSelected(s)}>Buy</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {selected && (
        <BuyModal
          space={selected}
          onClose={() => setSelected(null)}
          onSuccess={(res) => setSuccessMsg('Cast posted successfully')}
        />
      )}

      {successMsg && (
        <div className="col-span-full">
          <div className="p-4 bg-green-50 border border-green-200 rounded">{successMsg}</div>
        </div>
      )}
    </div>
  )
}

export default SpacesList
