import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudioPage from './pages/StudioPage';
import MyProutsPage from './pages/MyProutsPage';
import TribunalPage from './pages/TribunalPage';
import TestPage from './pages/TestPage';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-600">Chargement de Prout Community...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/signup" 
          element={session ? <Navigate to="/dashboard" replace /> : <SignUpPage />} 
        />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route
          path="/dashboard"
          element={session ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/studio"
          element={session ? <StudioPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/my-prouts"
          element={session ? <MyProutsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tribunal"
          element={session ? <TribunalPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;