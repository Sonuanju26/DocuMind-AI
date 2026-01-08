import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import PinSetupModal from './components/PinSetupModal';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [authType, setAuthType] = useState('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleGetStarted = () => {
    setAuthType('signup');
    setCurrentPage('auth');
  };

  const handleLoginClick = () => {
    setAuthType('login');
    setCurrentPage('auth');
  };

  const handleSignupClick = () => {
    setAuthType('signup');
    setCurrentPage('auth');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    if (!showPinSetup) {
      setCurrentPage('dashboard');
    }
  };

  const handlePinSetup = (userData) => {
    setPendingUser(userData);
    setShowPinSetup(true);
  };

  const handlePinSetupComplete = () => {
    setShowPinSetup(false);
    setPendingUser(null);
    setCurrentPage('dashboard');
  };

  const handleSkipPinSetup = () => {
    setShowPinSetup(false);
    setPendingUser(null);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const handleHome = () => {
    setCurrentPage('landing');
  };

  const handleToggleAuthType = () => {
    setAuthType(authType === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <LandingPage 
          onGetStarted={handleGetStarted} 
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
      )}
      
      {currentPage === 'auth' && (
        <AuthModal
          type={authType}
          onClose={() => setCurrentPage('landing')}
          onSuccess={handleAuthSuccess}
          onToggleType={handleToggleAuthType}
          onPinSetup={handlePinSetup}
        />
      )}

      {showPinSetup && pendingUser && (
        <PinSetupModal
          user={pendingUser}
          onClose={handleSkipPinSetup}
          onSuccess={handlePinSetupComplete}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          onHome={handleHome} 
        />
      )}
    </div>
  );
}

export default App;