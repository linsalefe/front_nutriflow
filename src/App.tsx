import React, { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import ListPage from './pages/ListPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import MealDetailPage from './pages/MealDetailPage';
import Error404Page from './pages/Error404Page';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <MainLayout
                  mode={mode}
                  onToggleMode={() => setMode(prev => (prev === 'light' ? 'dark' : 'light'))}
                >
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/list" element={<ListPage />} />
                    <Route path="/image" element={<ImageAnalysisPage />} />
                    <Route path="/meal/:id" element={<MealDetailPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Error404Page />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
