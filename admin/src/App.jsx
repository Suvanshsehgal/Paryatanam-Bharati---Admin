import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Pages
import { Login } from './pages/Login';
import { AccessDenied } from './pages/AccessDenied';
import { DashboardOverview } from './pages/DashboardOverview';
import { UsersPage } from './pages/UsersPage';
import { HomeLayoutPage } from './pages/HomeLayoutPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { TravelPage } from './pages/TravelPage';
import { PrasadPage } from './pages/PrasadPage';
import { WellnessPage } from './pages/WellnessPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Protected Admin Console Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="home-layout" element={<HomeLayoutPage />} />
                <Route path="marketplace" element={<MarketplacePage />} />
                <Route path="travel" element={<TravelPage />} />
                <Route path="prasad" element={<PrasadPage />} />
                <Route path="wellness" element={<WellnessPage />} />
              </Route>

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
