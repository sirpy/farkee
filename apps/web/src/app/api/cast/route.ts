import { NextResponse } from "next/server"
import { createWalletClient, createPublicClient, http, keccak256, decodeEventLog, parseAbiItem, parseAbi } from 'viem'
import { privateKeyToAccount } from "viem/accounts"
import { celo } from 'viem/chains'
import {
    makeCastAdd,
    FarcasterNetwork,
    NobleEd25519Signer,
} from "@farcaster/hub-nodejs";
import { CastType, Message } from "@farcaster/core";  // for encoding
import { de } from "zod/v4/locales";
import { get } from "http";
import { getAppEd25519Signer, getSponsorSigner } from "@/lib/signers";

const HUB_URL = "https://hub.pinata.cloud";  // or another Farcaster Hub
const BuyEvent = parseAbiItem(
    'event BuySpace(address buyer,uint amount,bytes32 textHash,uint fid,uint8 spaceType,uint nonce)'
)
const methodAbi = parseAbi([
    "function markExecuted(uint nonce)"
])


const sponsor = getSponsorSigner()
const signer = getAppEd25519Signer()

// 2. Choose chain (mainnet or alfajores)
const chain = celo // or celo

// 3. Create wallet client
const walletClient = createWalletClient({
    account:sponsor,
    chain,
    transport: http(),
})

// 4. (Optional) Public client
const publicClient = createPublicClient({
    chain,
    transport: http(),
})


const createCast = async (text: string, fid: number, signer: NobleEd25519Signer) => {

    // 3. Prepare the cast body
    const castBody = {
        type: CastType.CAST,
        text,
        embeds: [],
        embedsDeprecated: [],
        mentions: [],
        mentionsPositions: [],
    };

    // 4. Create the CastAdd message
    const messageResult = await makeCastAdd(
        castBody,
        { fid, network: FarcasterNetwork.MAINNET },
        signer
    );

    if (messageResult.isErr()) {
        throw new Error(`Error making cast: ${messageResult.error.message}`);
    }
    const message = messageResult.value;

    // 5. Encode the message to bytes to send
    const bytes = Message.encode(message).finish();
    const messageBytes = Buffer.from(bytes);

    // 6. Submit to the hub
    const response = await fetch(`${HUB_URL}/v1/submitMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: messageBytes,
    });

    const json = await response.json();
    console.log("Hub response:", json);
    return json
}

const getBuyLogs = async (txHash: `0x${string}`) => {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    //parse logs to find relevant event


    const decoded = receipt.logs.map(log => {
        try {
            return decodeEventLog({
                abi: [BuyEvent],
                data: log.data,
                topics: log.topics,
            })
        } catch {
            return null
        }
    }).filter(_ => _ !== null);
    return decoded[0]

}

const markExecuted = async (nonce: bigint) => {
    const hash = await walletClient.writeContract({
        address: "0xff1dd185a7b6463ac94dF0f92F279774B43DcD8c",
        abi: methodAbi,
        functionName: "markExecuted",
        args: [nonce],
    })

    console.log(hash)
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(receipt)
    return hash
}

export async function POST(req: Request) {
    try {

        const { text, txHash } = await req.json()
        const buyEvent = await getBuyLogs(txHash)
        if (!buyEvent) {
            return NextResponse.json({ error: "Buy event not found in transaction" }, { status: 400 })
        }
        const fid = Number(buyEvent.args.fid)
        const textHash = buyEvent.args.textHash
        const castType = buyEvent.args.spaceType
        if (keccak256(Buffer.from(text)) !== textHash) {
            return NextResponse.json({ error: "Text hash does not match" }, { status: 400 })
        }

        // TODO: validate text according to castType
        const json = await createCast(text, fid, signer)

        //mark as executed on chain? TODO
        await markExecuted(buyEvent.args.nonce)
        return NextResponse.json(json)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
