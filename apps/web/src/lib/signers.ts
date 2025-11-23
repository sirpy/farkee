import { NobleEd25519Signer } from "@farcaster/core"
import { privateKeyToAccount } from "viem/accounts"

export const getSponsorSigner = () => {
    const APP_SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PKEY
    if (!APP_SPONSOR_PRIVATE_KEY) {
        throw new Error("APP_SPONSOR_PRIVATE_KEY not configured")
    }
    return privateKeyToAccount(APP_SPONSOR_PRIVATE_KEY as `0x${string}`)
}

// this is our app FID owner's signer - it can sponsor requests + should have gas to pay for onchain txs
export const getAppFidSigner = () => {
    const APP_SPONSOR_PRIVATE_KEY = process.env.APP_PKEY
    if (!APP_SPONSOR_PRIVATE_KEY) {
        throw new Error("APP_SPONSOR_PRIVATE_KEY not configured")
    }
    return privateKeyToAccount(APP_SPONSOR_PRIVATE_KEY as `0x${string}`)
}

// this should be secure from oasis tee and can sign messages to post on users feeds
export const getAppEd25519Signer = () => {
    const APP_SIGNER_PKEY = process.env.SIGNER_PKEY
    if (!APP_SIGNER_PKEY) {
        throw new Error("APP_SPONSOR_PRIVATE_KEY not configured")
    }
    const signer = new NobleEd25519Signer(new Uint8Array(Buffer.from(APP_SIGNER_PKEY as `0x${string}`, "hex")));
    return signer
}
export const getAppEd25519SignerPublicAddress = () => {
    const APP_SIGNER_PKEY = process.env.SIGNER_PKEY
    if (!APP_SIGNER_PKEY) {
        throw new Error("APP_SPONSOR_PRIVATE_KEY not configured")
    }
    const signer = privateKeyToAccount(APP_SIGNER_PKEY as `0x${string}`)
    return signer.address
}
