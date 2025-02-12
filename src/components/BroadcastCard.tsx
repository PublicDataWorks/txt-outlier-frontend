import { LucideIcon, Settings } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SettingsModal from '@/components/SettingsModal.tsx';

interface BroadcastCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const sampleSettings: BroadcastSettings = {
  schedule: {
    'Su': { enabled: true, time: '09:00 ET' },
    'Mo': { enabled: true, time: '10:30 ET' },
    'Tu': { enabled: false, time: '14:00 ET' },
    'We': { enabled: true, time: '15:45 ET' },
    'Th': { enabled: false, time: '11:15 ET' },
    'Fr': { enabled: true, time: '16:00 ET' },
    'Sa': { enabled: false, time: '13:30 ET' }
  },
  batchSize: 500
};

const BroadcastCard = ({ title, icon: Icon, children }: BroadcastCardProps) => {
  return (
    <Card className="dark:bg-[#2A2A2A] dark:border-neutral-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
          </div>
          <SettingsModal
            initialSettings={sampleSettings}
            userTimeZone="America/New_York" // or whatever timezone you're testing with
            onSave={async (newSettings) => {
              console.log('New settings:', newSettings);
              // Your save logic here
            }}
          />
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default BroadcastCard;
