"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import BuyModal from "./BuyModal"

const SAMPLE_SPACES = [
  { fid: 1001, owner: "@alice", price: "5 G$", type: 'Roast' },
  { fid: 2002, owner: "@bob", price: "3 G$", type: 'Shill' },
  { fid: 3003, owner: "@carol", price: "10 G$", type: 'Sponsor' },
]

export function SpacesList() {
  const [selected, setSelected] = useState<any | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (SAMPLE_SPACES.length === 0) {
    return <div className="text-center text-muted-foreground">No spaces available</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SAMPLE_SPACES.map((s) => (
        <Card key={s.fid} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Owner</div>
              <div className="font-medium">{s.owner}</div>
              <div className="mt-2 text-xs inline-block px-2 py-1 rounded bg-gray-100 text-xs">Type: {s.type}</div>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold text-lg">{s.price}</div>
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
