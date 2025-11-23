import React from 'react'
import SpacesList from '@/components/marketplace/SpacesList'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Marketplace - my-celo-app',
  description: 'Browse Farkee ad spaces and submit purchased casts',
}

export default function MarketplacePage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Browse available commission slots and submit text after purchase.</p>
        </div>

        <Card className="p-4">
          <SpacesList />
        </Card>
      </div>
    </div>
  )
}
