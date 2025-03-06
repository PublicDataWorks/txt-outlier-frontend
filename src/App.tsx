import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes, HashRouter } from 'react-router-dom';

import GoogleOauthPopup from './convo-sidebar/components/GoogleOauthPopup.tsx';
import Logout from './convo-sidebar/components/Logout.tsx';
import PrivateRoute from './convo-sidebar/components/PrivateRoute.tsx';
import { LOGIN_PATH, LOGOUT_PATH } from './convo-sidebar/constants/routes.ts';
import Home from './convo-sidebar/pages/Home/index.tsx';
import AuthProvider from './convo-sidebar/providers/auth.tsx';
import AnonKeyProvider from './convo-sidebar/providers/key.tsx';

import LastBatchSection from '@/components/LastBatchSection';
import NextBatchSection from '@/components/NextBatchSection';
import PastBroadcastsSection from '@/components/PastBroadcastsSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import CampaignPage from '@/pages/campaign/index.tsx';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnonKeyProvider>
          <HashRouter>
            <Routes>
              <Route path={LOGIN_PATH} element={<GoogleOauthPopup />} />
              <Route path={LOGOUT_PATH} element={<Logout />} />
              <Route
                path="/convo-sidebar"
                element={
                  <PrivateRoute>
                    <div className="h-screen overflow-y-scroll bg-missive-background-color text-missive-text-color-a missive-scroll">
                      <Home />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="campaign"
                element={
                  <PrivateRoute>
                    <ScrollArea className="h-screen w-full border-l bg-background dark:border-l-neutral-800">
                      <div className="space-y-6 p-4">
                        <CampaignPage />
                      </div>
                    </ScrollArea>
                  </PrivateRoute>
                }
              />
              <Route
                path="*"
                element={
                  <PrivateRoute>
                    <ScrollArea className="h-screen w-full border-l bg-background dark:border-l-neutral-800">
                      <div className="space-y-6 p-4">
                        <NextBatchSection />
                        <LastBatchSection />
                        <PastBroadcastsSection />
                      </div>
                    </ScrollArea>
                  </PrivateRoute>
                }
              />
            </Routes>
          </HashRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </AnonKeyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
