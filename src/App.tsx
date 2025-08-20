import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useThemeMode } from './contexts/ThemeModeContext';

import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import Error404Page from './pages/Error404Page';
import PrivateRoute from './components/PrivateRoute';

type Mode = 'light' | 'dark';

export default function App() {
  const { mode, toggleMode } = useThemeMode();
  const safeMode: Mode = mode === 'dark' ? 'dark' : 'light';

  return (
    <Router>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* privadas (pai com layout + guard) */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout mode={safeMode} onToggleMode={toggleMode} />
            </PrivateRoute>
          }
        >
          {/* raiz privada → chat */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/image" element={<ImageAnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/404" element={<Error404Page />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>

        {/* fallback público */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
