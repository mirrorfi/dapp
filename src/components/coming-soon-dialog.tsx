import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import Image from "next/image"

interface ComingSoonDialogProps {
    brokenAhhProtocol: string
    }

export function ComingSoonDialog({brokenAhhProtocol}: ComingSoonDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Image
                  src={`/PNG/${brokenAhhProtocol.toLowerCase()}-logo.png`}
                  alt={`${brokenAhhProtocol} logo`}
                  width={24}
                  height={24}
                />{brokenAhhProtocol}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>

        </DialogHeader>
        <DialogDescription>
            We are currently working on this feature to allow you to use protocols such as Raydium, Kamino, Drift and Orca.
            These features will be coming soon. Stay tuned for updates! 😁
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
