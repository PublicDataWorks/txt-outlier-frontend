import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SendConfirmationModalProps {
  onConfirm: () => void;
}

export function SendNowDialog({ onConfirm }: SendConfirmationModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] dark:text-white">
          Send now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#2A2A2A] border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Send now</DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <p className="text-sm text-neutral-400">
            Conversation starters will be sent to all recipients.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="flex-1 bg-neutral-800 text-white hover:bg-neutral-700"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
          >
            Send now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
