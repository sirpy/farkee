"use client"

import { useEffect, useState } from "react"
import { Card } from '@/components/ui/card'

type RecentCast = {
  id: string
  fid: number
  text: string
  createdAt: number
  hubResponse: any
}

export default function CastsPage() {
  const [casts, setCasts] = useState<RecentCast[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/recent-casts')
        const json = await res.json()
        if (res.ok) setCasts(json.result || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Recent Casts</h1>
        <p className="text-sm text-muted-foreground mb-6">Casts that were posted through this app (dev in-memory list).</p>

        {loading ? (
          <div>Loading…</div>
        ) : casts.length === 0 ? (
          <Card className="p-4">No casts posted yet.</Card>
        ) : (
          <div className="space-y-3">
            {casts.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">FID</div>
                    <div className="font-medium">{c.fid}</div>
                    <div className="mt-2 whitespace-pre-wrap">{c.text}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Posted: {new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
