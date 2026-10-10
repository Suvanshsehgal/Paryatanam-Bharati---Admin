import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
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
import { ActivityMonitorPage } from './pages/ActivityMonitorPage';
import { IssueReportsPage } from './pages/IssueReportsPage';
import { SuperAdminApprovalsPage } from './pages/SuperAdminApprovalsPage';

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
                <Route
                  path="activity"
                  element={
                    <ProtectedRoute roles={['SUPER_ADMIN']}>
                      <ActivityMonitorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="approvals"
                  element={
                    <ProtectedRoute roles={['SUPER_ADMIN']}>
                      <SuperAdminApprovalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="reports" element={<IssueReportsPage />} />
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
