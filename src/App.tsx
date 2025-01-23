import { ScrollArea } from '@/components/ui/scroll-area';

import NextBatchSection from '@/components/NextBatchSection';

import './App.css';

function App() {
  return (
    <ScrollArea className="h-screen w-full border-l bg-background dark:bg-[#242424] dark:border-l-neutral-800 dark">
      <div className="space-y-6 p-4">
        <NextBatchSection />
      </div>
    </ScrollArea>
  );
}

export default App;
