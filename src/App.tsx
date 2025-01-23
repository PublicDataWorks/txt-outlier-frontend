import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import NextBatchSection from '@/components/NextBatchSection';
import { ScrollArea } from '@/components/ui/scroll-area';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 15 * 60 * 1000, // 15 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollArea className="h-screen w-full border-l bg-background dark:bg-[#242424] dark:border-l-neutral-800 dark">
        <div className="space-y-6 p-4">
          <NextBatchSection />
        </div>
      </ScrollArea>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
