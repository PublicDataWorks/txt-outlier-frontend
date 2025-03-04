import { Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SendNowDialogProps {
  onSend: () => void;
  recipientCount: number;
  messagePreview: string;
  segmentDescription: string;
  disabled?: boolean;
}

export function SendNowDialog({
  onSend,
  recipientCount,
  messagePreview,
  segmentDescription,
  disabled = false,
}: SendNowDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    onSend();
    setOpen(false);
    toast({
      title: 'Broadcast Sent',
      description: `Your message has been sent to ${recipientCount.toLocaleString()} recipients.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Send className="mr-2 h-4 w-4" />
          Send Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Broadcast</DialogTitle>
          <DialogDescription>
            You are about to send this message to{' '}
            {recipientCount.toLocaleString()} recipients:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Message Preview:</p>
            <p className="text-sm text-muted-foreground">{messagePreview}</p>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-medium">Sending to:</p>
            <p className="text-sm text-muted-foreground">
              {segmentDescription}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
