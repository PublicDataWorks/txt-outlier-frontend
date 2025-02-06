import { DialogTrigger } from '@radix-ui/react-dialog';
import { AxiosError } from 'axios';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { getSendNowError } from '@/lib/send-now-error';

interface SendConfirmationModalProps {
  sendNow: () => Promise<void>;
}

export function SendNowDialog({ sendNow }: SendConfirmationModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  const { toast } = useToast();

  const handleSend = async () => {
    try {
      setSending(true);
      await sendNow();
      toast({ title: 'Broadcast sent' });
      setOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          const errorCode = error.response.data.message as string;
          const errorMessage = getSendNowError(errorCode);
          toast({
            title: 'Error while sending broadcast',
            description: errorMessage,
          });
        }
      } else {
        toast({
          title: 'Error while sending broadcast',
          description: 'An unexpected error occurred, please contact admin.',
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] dark:text-white">
          Send now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#2A2A2A] border-neutral-700 text-white">
        <DialogDescription />
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
            onClick={handleSend}
            className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
            disabled={sending}
          >
            {sending ? <LoadingSpinner /> : 'Send now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
