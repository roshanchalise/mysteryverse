import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Puzzle from './pages/Puzzle';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { playClickSound } from './utils/audio';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystery-gold"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystery-gold"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    // Global click handler for all buttons and links
    const handleGlobalClick = (event) => {
      const target = event.target;
      
      // Check if the clicked element is a button, link, or has a click handler
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.type === 'submit' ||
        target.role === 'button' ||
        target.onclick ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('btn-primary') ||
        target.classList.contains('btn-secondary') ||
        target.classList.contains('btn') ||
        target.hasAttribute('onClick')
      ) {
        playClickSound();
      }
    };

    // Add the global click listener
    document.addEventListener('click', handleGlobalClick, true); // Use capture phase

    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/verse/:id" element={
          <PrivateRoute>
            <Puzzle />
          </PrivateRoute>
        } />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;