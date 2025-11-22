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
- [ ] Set ad price
- [ ] check add types (roast, shill etc...)
- [ ] Send signer request to backend
- [ ] Ask user to complete signer request (qr code)
- [ ] poll for signing request status
- [ ] Once request is signed user executes on chain tx to write price+fid+types to a smart contract

### See list of ad spaces
- [ ] List of profiles + ad price + supported ad types
- [ ] Buy buttons per profile (roast cost X, shill cost Z)
- [ ] do an erc677 tx using G$ to smart contract - encoded function call: buy(fid,type,texthash)
- [ ] once tx is success: send backend signed request with text of cast

## Nice to have
- Page with recent posts
- Earning reports
  
## Smart contract
https://celoscan.io//address/0xff1dd185a7b6463ac94dF0f92F279774B43DcD8c#readContract




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
