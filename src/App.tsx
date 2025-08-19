import React from 'react';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeMode } from './contexts/ThemeModeContext';

import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ImageAnalysisPage from './pages/ImageAnalysisPage';
import Error404Page from './pages/Error404Page';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <MainLayout
                mode={mode as 'light' | 'dark'}
                onToggleMode={toggleMode}
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/image" element={<ImageAnalysisPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Error404Page />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;