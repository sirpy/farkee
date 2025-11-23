import { NextResponse } from "next/server"
import { getRecentCasts } from "@/lib/cast-store"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '20')
    const casts = getRecentCasts(limit)
    return NextResponse.json({ result: casts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
