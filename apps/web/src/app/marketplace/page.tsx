import React from 'react'
import SpacesList from '@/components/marketplace/SpacesList'

export const metadata = {
  title: 'Marketplace - my-celo-app',
  description: 'Browse Farkee ad spaces and submit purchased casts',
}

export default function MarketplacePage() {
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      <p className="mb-6 text-muted-foreground">Browse available commission slots and submit text after purchase.</p>

      <SpacesList />
    </div>
  )
}
