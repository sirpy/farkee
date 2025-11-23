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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SAMPLE_SPACES.map((s) => (
        <Card key={s.fid} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Owner</div>
              <div className="font-medium">{s.owner}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-medium">{s.price}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm">Type: {s.type}</div>
            <Button size="sm" onClick={() => setSelected(s)}>Buy</Button>
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
