import { createPublicClient, http, formatEther } from "viem";
import { celo } from "viem/chains";
import { useCallback } from "react";
import { useWriteContract } from "wagmi";
import { keccak256, encodeAbiParameters, parseEther } from "viem";

// Add minimal ABI for getSpaces
const FARKEE_ABI = [
    {
        name: "getSpaces",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            {
                type: "tuple[]",
                components: [
                    { name: "fid", type: "uint256" },
                    { name: "owner", type: "address" },
                    { name: "price", type: "uint256" },
                    { name: "spaceType", type: "uint8" },
                ],
                name: "",
            },
        ],
    },
] as const

// ERC20 ABI fragment for transferAndCall
const ERC20_ABI = [
    {
        name: "transferAndCall",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
] as const

type RawSpace = { fid: bigint, owner: string; price: bigint; spaceType: number }
type Space = { fid: string, owner: string; price: string; spaceType: number }


const ROFL_HOST = process.env.NEXT_PUBLIC_ROFL_HOST || ""
const FARKEE_CONTRACT = process.env.NEXT_PUBLIC_FARKEE_CONTRACT || ""
const CELO_RPC = process.env.NEXT_PUBLIC_CELO_RPC || "https://forno.celo.org"
const erc20Address = process.env.NEXT_PUBLIC_PAYMENT_TOKEN as `0x${string}`

const client = createPublicClient({
    chain: celo,
    transport: http(CELO_RPC),
})

const registerSpace = async (userWallet: `0x${string}`, fid: number, adPrice: number, adType: number) => {
    const res = await fetch(ROFL_HOST + "/api/signed-key-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWallet, fid, adPrice, adType }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || "Failed creating signed key request")
    const { token, deeplinkUrl } = json.result.signedKeyRequest
    return {deeplinkUrl, token}
}


const getAdSpaces = async (): Promise<Space[]> => {
    if (!FARKEE_CONTRACT) throw new Error("Missing FARKEE contract address (NEXT_PUBLIC_FARKEE_ADDRESS)")


    const raw = (await client.readContract({
        address: FARKEE_CONTRACT as `0x${string}`,
        abi: FARKEE_ABI,
        functionName: "getSpaces",
    })) as RawSpace[]

    // Normalize BigInt prices to strings for easier JSON consumption
    return raw.map((s) => ({
        fid: s.fid.toString(),
        owner: s.owner,
        price: formatEther(s.price),
        spaceType: Number(s.spaceType),
    }))
}

export const useFarkeeApi = () => {

    // Prepare contract write for transferAndCall
    const { writeContractAsync } = useWriteContract()

    // buySpace implementation
    const buySpace = useCallback(
        async (fid: number, price: number, spaceType: number, text: string) => {
            if (!FARKEE_CONTRACT) throw new Error("Missing FARKEE contract address");

            // 1. Hash the text
            const textHash = keccak256(Buffer.from(text, "utf8"));

            // 2. Encode parameters for data
            const data = encodeAbiParameters(
                [
                    { name: "textHash", type: "bytes32" },
                    { name: "fid", type: "uint256" },
                    { name: "spaceType", type: "uint8" },
                ],
                [textHash, BigInt(fid), spaceType]
            );

            // 3. Call transferAndCall
            const txHash = await writeContractAsync({
                address: erc20Address,
                abi: ERC20_ABI,
                functionName: "transferAndCall",
                args: [
                    FARKEE_CONTRACT as `0x${string}`,
                    parseEther(price.toString()),
                    data,
                ],
            });
            

            // 4. Wait for transaction confirmation
            // (optional: you can use useWaitForTransaction if you want to expose status)
            await client.waitForTransactionReceipt({hash: txHash})
            // 5. Call backend /cast endpoint
            const res = await fetch(ROFL_HOST + "/api/cast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    txHash: txHash,
                    text,
                }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || "Failed to call /cast endpoint");
            }
            return txHash;
        },
        [writeContractAsync]
    );

    return {
        registerSpace,
        getAdSpaces,
        buySpace, // expose the hook
    }
}