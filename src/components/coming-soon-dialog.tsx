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
      <DialogContent className="sm:max-w-[425px]flex flex-col items-center justify-center text-center">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle>Coming Soon</DialogTitle>

        </DialogHeader>
        <div className="w-full flex flex-col items-center">
          <Image
            src={`/PNG/${brokenAhhProtocol.toLowerCase()}-logo.png`}
            alt={`${brokenAhhProtocol} logo`}
            width={64}
            height={64}
          />
        </div>
        <DialogDescription>
            Work in Progress. Coming Soon! 😁
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
