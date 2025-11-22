import { NextResponse } from "next/server"
import { mnemonicToAccount } from "viem/accounts"
import * as ed from "@noble/ed25519"

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
        const APP_FID = process.env.APP_FID
        const APP_MNEMONIC = process.env.APP_MNEMONIC

        if (!APP_FID || !APP_MNEMONIC) {
            return NextResponse.json({ error: "APP_FID or APP_MNEMONIC not configured" }, { status: 500 })
        }

        const { secretKey, publicKey } = await ed.keygenAsync();

        const key = "0x" + Buffer.from(publicKey).toString("hex") as `0x${string}`;
        console.log("Generated keypair", { secretKey, publicKey, key })
        const account = mnemonicToAccount(APP_MNEMONIC)

        const until = new Date().setFullYear(new Date().getFullYear() + 1)

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

        const sponsorSignature = await account.signMessage({
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
