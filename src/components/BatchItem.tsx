import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { PastBroadcast } from '@/apis/broadcasts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatToLocalTime } from '@/lib/date';
import { cn } from '@/lib/utils';

interface BatchItemProps {
  broadcast: PastBroadcast;
}

export default function BatchItem({ broadcast }: BatchItemProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    runAt,
    firstMessage,
    secondMessage,
    totalFirstSent,
    totalSecondSent,
    totalUnsubscribed,
  } = broadcast;

  const formattedDate = formatToLocalTime(new Date(runAt * 1000));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-3 text-sm hover:bg-accent dark:hover:bg-neutral-800">
        <span>{formattedDate}</span>
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-90',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 overflow-hidden px-3 py-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total recipients</span>
            <span className="font-medium tabular-nums">
              {totalFirstSent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Follow-up messages</span>
            <span className="font-medium tabular-nums">
              {totalSecondSent.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Unsubscribes</span>
            <span className="font-medium tabular-nums text-red-600 dark:text-red-400">
              {totalUnsubscribed.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Conversation starter</label>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{firstMessage}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-up message</label>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm whitespace-pre-wrap">{secondMessage}</p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
