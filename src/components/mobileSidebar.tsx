"use client"

import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Sidebar } from "./sidebar"

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
