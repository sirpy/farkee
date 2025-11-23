"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

export default function CreateListingPage() {
  const search = useSearchParams()
  const router = useRouter()
  const type = search.get('type') || 'Custom'
  const policy = search.get('policy') || ''

  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!price) return alert('Please enter a price')
    setSaving(true)
    try {
      // save to localStorage as a simple listing
      const raw = localStorage.getItem('farkee_listings')
      const listings = raw ? JSON.parse(raw) : []
      const item = { id: String(Date.now()), type, policy, price }
      listings.push(item)
      localStorage.setItem('farkee_listings', JSON.stringify(listings))
      router.push(`/start-earning/confirm?type=${encodeURIComponent(type)}&price=${encodeURIComponent(price)}`)
    } catch (err) {
      console.error(err)
      alert('Failed saving listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Create listing: {type}</h2>
          <div className="text-sm text-muted-foreground mb-4">Policy: {policy}</div>

          <label className="text-sm font-medium">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 5 G$" className="w-full border px-3 py-2 rounded mt-1 mb-4" />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Create Listing'}</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
