import Link from 'next/link'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">Farkee — Farcaster Commission Marketplace</h1>
            <p className="text-muted-foreground mb-6">Sell and execute single-cast commissions securely through a backend TEE and Farcaster signer flow.</p>

            <div className="flex gap-3 justify-center mb-6">
              <Link href="/marketplace" className="px-4 py-2 rounded bg-primary text-white">Browse Marketplace</Link>
              <Link href="/start-earning" className="px-4 py-2 rounded border">Start Earning</Link>
            </div>
          </div>
        </Card>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">How it works</h3>
            <p className="text-sm text-muted-foreground mt-2">Buy a commission slot on-chain, submit your cast text through the MiniApp, and our backend validates and posts the cast on behalf of the handle.</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">For Creators</h3>
            <p className="text-sm text-muted-foreground mt-2">Mint slots, set prices and content policy, then earn instantly when buyers execute a purchase.</p>
          </div>
        </section>

        <div className="mt-8 text-sm text-muted-foreground">To post a cast after purchase, go to Marketplace and submit the transaction hash and cast text. The backend will validate and publish the cast.</div>
      </div>
    </div>
  )
}
