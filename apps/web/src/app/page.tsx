import Link from 'next/link'

export default function Home() {
  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">Farkee — Farcaster Commission Marketplace</h1>
        <p className="text-muted-foreground mb-6">Sell and execute single-cast commissions securely through a backend TEE and Farcaster signer flow.</p>

        <div className="flex gap-3 justify-center mb-6">
          <Link href="/marketplace" className="px-4 py-2 rounded bg-primary text-white">Browse Marketplace</Link>
          <Link href="/start-earning" className="px-4 py-2 rounded border">Start Earning</Link>
        </div>

        <div className="text-sm text-muted-foreground">To post a cast after purchase, go to Marketplace and submit the transaction hash and cast text. The backend will validate and publish the cast.</div>
      </div>
    </div>
  )
}
