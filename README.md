# TODO


## Backend
- Should have Private key + Gas
### User join
- Input: fid
- [ ] generate deterministic private key from seed=SECRET+fid
- [ ] Returns and generate signer request to farcaster

### Create a cast for fid
- Inputs: txhash, text, signed text by payer wallet
- [ ] Verifies the text matches the texthash in contract
- [ ] Verifies that the last event for this FID was done by paying wallet and wasnt done yet
- [ ] Post cast
- [ ] Modifies state of smart contract record to done

## Miniapp

### User join
- [ ] Input for ad price
- [ ] Input for ad type (roast, shill etc...)
- [ ] Send signer request to backend with ad price + ad type + user fid + userWalletAddress
- [ ] Ask user to complete signer request (qr code)
- [ ] poll for signing request status
- [ ] Once request is signed show success to user

### See list of ad spaces
- [ ] Read from smart contract (getSpaces method) List of profiles + ad price + ad type
- [ ] Show links to the user profiles (can we use fid or we need the handle)
- [ ] Buy button per ad space
- [ ] on buy:
      - [ ] ask user for ad text 
      - [ ] do an erc677 tx using G$ to smart contract - encoded function call: buy(fid,type,texthash)
      - [ ] once tx is success: send backend (/api/cast) signed request with text+txHash

## Nice to have
- Page with recent posts
- Earning reports
  
## Smart contract
https://celoscan.io//address/0x3DC6FFB220397b2F342a52dF92136edb5a4850c6#readContract




# my-celo-app

A new Celo blockchain project

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
