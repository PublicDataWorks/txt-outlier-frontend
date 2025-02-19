import { LucideIcon } from 'lucide-react';

import SettingsModal from '@/components/SettingsModal.tsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BroadcastCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

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
          {title === 'Next batch' && <SettingsModal />}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default BroadcastCard;
