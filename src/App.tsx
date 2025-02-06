import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
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
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    const theme = root.getAttribute('data-theme');

    if (theme === 'dark' || theme === 'light') {
      root.classList.add(theme);
    } else {
      root.classList.add('light');
    }
  }, []);

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
                    <div
                      className="h-screen overflow-y-scroll bg-missive-background-color text-missive-text-color-a missive-scroll">
                      <Home />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="*"
                element={
                  <PrivateRoute>
                    <ScrollArea className="h-screen w-full border-l bg-background dark:bg-[#242424] dark:border-l-neutral-800">
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
