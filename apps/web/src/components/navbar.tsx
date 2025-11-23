"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, DollarSign } from "lucide-react"

const navLinks = [
  { name: "Home", href: "/", Icon: Home },
  { name: "Marketplace", href: "/marketplace", Icon: ShoppingCart },
  { name: "Start Earning", href: "/start-earning", Icon: DollarSign },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full border-t bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto max-w-screen-2xl">
        <nav className="flex items-center justify-around h-16 px-4 md:justify-center md:gap-6">
          {navLinks.map(({ name, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors hover:text-primary px-2 py-1 md:flex-row md:gap-2 md:text-sm ${
                pathname === href ? "text-foreground" : "text-foreground/70"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden md:inline">{name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
