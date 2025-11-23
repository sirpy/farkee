import { NextResponse } from "next/server"
import { mnemonicToAccount } from "viem/accounts"
import { getAppEd25519SignerPublicAddress, getAppFidSigner, getSponsorSigner } from "@/lib/signers"
import { celo } from "viem/chains"
import { createWalletClient, http } from "viem"
import { parseEther } from "viem";

const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: "Farcaster SignedKeyRequestValidator",
    version: "1",
    chainId: 10,
    verifyingContract: "0x00000000fc700472606ed4fa22623acf62c60553",
} as const

const SIGNED_KEY_REQUEST_TYPE = [
    { name: "requestFid", type: "uint256" },
    { name: "key", type: "bytes" },
    { name: "deadline", type: "uint256" },
] as const

// 2. Choose chain (mainnet or alfajores)
const chain = celo // or celo
const sponsor = getSponsorSigner()

// 3. Create wallet client
const walletClient = createWalletClient({
    account:sponsor,
    chain,
    transport: http(),
})

// Add FARKEE contract address and minimal registerSpace ABI
const FARKEE_CONTRACT = process.env.FARKEE_CONTRACT || process.env.NEXT_PUBLIC_FARKEE_CONTRACT || ""

const REGISTER_SPACE_ABI = [
    {
        name: "registerSpace",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "fid", type: "uint256" },
            { name: "owner", type: "address" },
            { name: "price", type: "uint256" },
            { name: "spaceType", type: "uint8" },
        ],
        outputs: [],
    },
] as const

export async function POST(req: Request) {
    try {
        
        const APP_FID = process.env.APP_FID

        if (!APP_FID) {
            return NextResponse.json({ error: "APP_FID not configured" }, { status: 500 })
        }

        const { price, adType, fid, userWallet } = await req.json()

        const sponsor = getSponsorSigner()
        const account = getAppFidSigner()

        //this should be a secret account from oasis network
        const key = getAppEd25519SignerPublicAddress()
        
        const until = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

        const signature = await account.signTypedData({
            domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
            types: {
                SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
            },
            primaryType: "SignedKeyRequest",
            message: {
                requestFid: BigInt(APP_FID),
                key,
                deadline: BigInt(until),
            },
        })

        const sponsorSignature = await sponsor.signMessage({
            message: { raw: signature },
        });

        // forward to Farcaster client API
        const farcasterRes = await fetch("https://api.farcaster.xyz/v2/signed-key-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key,
                requestFid: Number(APP_FID),
                signature,
                deadline: until,
                sponsorship: {sponsorFid: Number(APP_FID), signature: sponsorSignature},
            }),
        })

        const json = await farcasterRes.json()
        
        
        if (!farcasterRes.ok) {
            return NextResponse.json({ error: json?.error || "farcaster api error", detail: json }, { status: 502 })
        }

        // -- New: call on-chain registerSpace using the server wallet client
        let registerTxHash: string | undefined = undefined
        try {
            if (FARKEE_CONTRACT) {
                // price is a decimal string (like "0.1")
                const priceArg = parseEther(price.toString())

                registerTxHash = await walletClient.writeContract({
                    address: FARKEE_CONTRACT as `0x${string}`,
                    abi: REGISTER_SPACE_ABI,
                    functionName: "registerSpace",
                    args: [BigInt(fid), userWallet as `0x${string}`, priceArg as any, Number(adType)],
                })
            }
        } catch (contractErr) {
            console.error("registerSpace on-chain failed:", contractErr)
            // continue — we still return the farcaster response, but include the contract error detail
            return NextResponse.json({ farcaster: json, registerError: String(contractErr) })
        }

        // Return farcaster response and tx hash (if any)
        return NextResponse.json({ farcaster: json, registerTx: registerTxHash })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
