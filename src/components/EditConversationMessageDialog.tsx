import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

type FormData = z.infer<typeof formSchema>;

interface EditConversationMessageDialogProps {
  title: string;
  message: string;
  onSave: (message: string) => Promise<void> | void;
}

const EditConversationMessageDialog = ({
  title,
  message,
  onSave,
}: EditConversationMessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: message,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      await onSave(data.message);
      form.reset({ message: data.message });
      setOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save message. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full whitespace-pre-wrap rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
          {message}
        </div>
      </DialogTrigger>
      <DialogContent className="h-svh w-svw max-w-none overflow-y-scroll bg-[#2A2A2A] border-neutral-700 text-white">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Note: these updates will apply to all future batches.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              {...form.register('message')}
              className="min-h-[300px] bg-[#1E1E1E] border-neutral-600 text-white"
              placeholder="Enter your message here..."
              disabled={isSaving}
            />
            {form.formState.errors.message && (
              <span className="text-sm text-red-500">
                {form.formState.errors.message.message}
              </span>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-neutral-800 text-white hover:bg-neutral-700"
              onClick={() => {
                form.reset({ message });
                setOpen(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2F80ED] hover:bg-[#2D7BE5] text-white min-w-[124px]"
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

export default EditConversationMessageDialog;
