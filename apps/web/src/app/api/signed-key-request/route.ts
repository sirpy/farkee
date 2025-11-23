import { NextResponse } from "next/server"
import { mnemonicToAccount } from "viem/accounts"
import { getAppEd25519SignerPublicAddress, getAppFidSigner, getSponsorSigner } from "@/lib/signers"

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

export async function POST(req: Request) {
    try {
        const required = [
            { name: 'APP_FID', value: process.env.APP_FID },
            { name: 'APP_PKEY', value: process.env.APP_PKEY },
            { name: 'SPONSOR_PKEY', value: process.env.SPONSOR_PKEY },
            { name: 'SIGNER_PKEY', value: process.env.SIGNER_PKEY },
        ]

        const missing = required.filter((r) => !r.value).map((r) => r.name)
        if (missing.length > 0) {
            return NextResponse.json({ error: 'Missing environment variables', missing }, { status: 500 })
        }

        const APP_FID = process.env.APP_FID as string

        const sponsor = getSponsorSigner()
        const account = getAppFidSigner()

        // this should be a secret account from oasis network
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

        return NextResponse.json(json)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
