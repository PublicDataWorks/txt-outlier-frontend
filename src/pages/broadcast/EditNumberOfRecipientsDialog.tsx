import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { Input } from '@/components/ui/input.tsx';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  noRecipients: z.coerce
    .number()
    .int()
    .min(1, 'Recipient count must be at least 1')
    .max(100_000, 'Recipient count cannot exceed 100,000'),
});

type FormData = z.infer<typeof formSchema>;

interface EditNumberOfRecipientsDialogProps {
  title: string;
  noRecipients: number;
  onSave: (noRecipients: number) => Promise<void> | void;
}

const EditNumberOfRecipientsDialog = ({
  title,
  noRecipients,
  onSave,
}: EditNumberOfRecipientsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noRecipients,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      await onSave(data.noRecipients);
      form.reset({ noRecipients: data.noRecipients });
      setOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Could not update recipient count. Please try again!',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2 p-2 w-full whitespace-pre-wrap rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
          <Users className="h-4 w-4" />
          <span className="text-sm">{noRecipients} recipients</span>
        </div>
      </DialogTrigger>
      <DialogContent className="h-svh w-svw max-w-none rounded-none overflow-y-scroll bg-background border border-input dark:bg-[#1E1E1E] dark:border-neutral-700">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-neutral-400">
              Set the number of recipients for the next batch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="recipientCount"
                className="text-right dark:text-neutral-400"
              >
                Recipients
              </label>
              <Input
                id="recipientCount"
                type="number"
                {...form.register('noRecipients')}
                className="bg-background dark:bg-[#1E1E1E] border-input"
              />
            </div>
            {form.formState.errors.noRecipients && (
              <span className="text-sm text-red-500">
                {form.formState.errors.noRecipients.message}
              </span>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-input hover:bg-input/50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              onClick={() => {
                form.reset({ noRecipients });
                setOpen(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNumberOfRecipientsDialog;
