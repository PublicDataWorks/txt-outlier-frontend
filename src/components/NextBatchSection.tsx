import { CalendarClockIcon, Users } from 'lucide-react';

import BroadcastCard from '@/components/BroadcastCard';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/date';

const NextBatchSection = () => {
  return (
    <BroadcastCard title="Next batch" icon={CalendarClockIcon}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground dark:text-neutral-300">
            Scheduled for{' '}
            {formatDateTime(
              new Date(),
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            )}
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-[#1E1E1E] border border-neutral-700 cursor-pointer hover:bg-[#2C2C2C]">
            <Users className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-300">5000 recipients</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 gap-2 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              Pause schedule
            </Button>
            <Button className="flex-1 bg-[#2F80ED] hover:bg-[#2D7BE5] dark:text-white">
              Send now
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Conversation starter message
            </label>
            <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
              This is Sarah from Outlier, Detroit's nonprofit newsroom. A
              reminder that rec centers and libraries are open and warm. More
              warming centers are listed here: https://bit.ly/3E0ntxV\n\nDTE
              cannot shut off utility service today because temps average below
              15 degrees for two days in a row.\n\nText STOP to unsubscribe or
              HELP for customer support. Terms & privacy: https://bit.ly/3cmY8Lk
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground dark:text-neutral-300">
              Follow-up message
            </label>
            <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer whitespace-pre-wrap hover:bg-accent/50 transition-colors dark:bg-[#1E1E1E] dark:border-neutral-600 dark:hover:bg-neutral-800">
              For other kinds of info, you can always text MENU for a list of
              resources we have to offer. Or text REPORTER to talk directly with
              a journalist. A reminder that if you lost a home in Detroit to tax
              foreclosure in 2015-2020 Wayne County may owe you money from the
              sale. Text REPAY for more info.
            </div>
          </div>
        </div>
      </div>
    </BroadcastCard>
  );
};

export default NextBatchSection;
