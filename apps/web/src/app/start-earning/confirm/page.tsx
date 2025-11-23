"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

export default function ConfirmListingPage() {
  const search = useSearchParams()
  const router = useRouter()
  const type = search.get('type') || 'Custom'
  const price = search.get('price') || ''

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Listing created</h2>
          <div className="mb-4">You created a listing for <strong>{type}</strong> at price <strong>{price}</strong>.</div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push('/marketplace')}>Go to Marketplace</Button>
            <Button onClick={() => router.push('/start-earning')}>Create another</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
