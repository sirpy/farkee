"use client"

import { useMiniApp } from "@/contexts/miniapp-context"

export default function SignedInHandle() {
  const mini = useMiniApp()
  const user = mini?.context?.user
  const handleName = user?.displayName || user?.username || (user?.fid ? `fid:${user.fid}` : null)
  const pfp = user?.pfpUrl

  if (!user) return null

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {pfp ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pfp} alt="pfp" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          )}
          <div className="text-sm font-medium">{handleName}</div>
        </div>
      </div>
    </div>
  )
}
