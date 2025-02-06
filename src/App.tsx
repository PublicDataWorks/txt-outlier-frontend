import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes, HashRouter } from 'react-router-dom';

import LastBatchSection from '@/components/LastBatchSection';
import NextBatchSection from '@/components/NextBatchSection';
import PastBroadcastsSection from '@/components/PastBroadcastsSection';
import { ScrollArea } from '@/components/ui/scroll-area';

import ConvoSidebar from './convo-sidebar/App.tsx';

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
      <HashRouter>
        <Routes>
          <Route
            path="convo-sidebar/*"
            element={<ConvoSidebar />} // Use Abc component for /convo-sidebar route
          />
          <Route
            path="*"
            element={
              <ScrollArea className="h-screen w-full border-l bg-background dark:bg-[#242424] dark:border-l-neutral-800 dark">
                <div className="space-y-6 p-4">
                  <NextBatchSection />
                  <LastBatchSection />
                  <PastBroadcastsSection />
                </div>
              </ScrollArea>
            }
          />
        </Routes>
      </HashRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
