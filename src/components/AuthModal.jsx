import React, { useState } from 'react';
import { FileText, X, Mail, Lock, User, Wifi, WifiOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import toast, { Toaster } from 'react-hot-toast';
import { hasOfflineAccess, getOfflineUserInfo } from '../utils/offlineAuth';
import { signupWithEmail, loginWithEmail, googleAuth, offlineLogin } from '../services/apiService';

const AuthModal = ({ type, onClose, onSuccess, onToggleType, onPinSetup }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlinePin, setOfflinePin] = useState('');
  
  const hasOffline = hasOfflineAccess();
  const offlineUser = hasOffline ? getOfflineUserInfo() : null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google User:', decoded);
      
      setLoading(true);
      
      // Authenticate with backend
      const response = await googleAuth(
        credentialResponse.credential,
        decoded.email,
        decoded.name,
        decoded.picture
      );
      
      toast.success(`Welcome ${decoded.name}! 🎉`);
      
      const userData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        picture: response.user.picture,
        authMethod: 'google',
        token: response.access_token
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Ask to set up offline PIN if not already set
      if (onPinSetup && !response.user.offline_enabled) {
        setTimeout(() => {
          onPinSetup(userData);
        }, 1500);
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  const handleOfflinePinLogin = async () => {
    if (!offlinePin) {
      toast.error('Please enter your PIN');
      return;
    }

    if (!offlineUser) {
      toast.error('No offline user found');
      return;
    }

    setLoading(true);

    try {
      // Try backend first (if online)
      try {
        const response = await offlineLogin(offlineUser.email, offlinePin);
        
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          picture: response.user.picture,
          authMethod: 'offline',
          token: response.access_token
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Welcome back! 🔓');
        
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } catch (backendError) {
        // If backend fails, try local verification
        const { verifyOfflinePin } = await import('../utils/offlineAuth');
        const localUser = verifyOfflinePin(offlinePin);
        
        if (localUser) {
          localStorage.setItem('user', JSON.stringify(localUser));
          toast.success('Welcome back! 🔓 (Offline mode)');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          toast.error('Incorrect PIN. Please try again.');
          setOfflinePin('');
        }
      }
    } catch (error) {
      console.error('Offline login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (type === 'signup' && !formData.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (type === 'signup') {
        response = await signupWithEmail(formData.name, formData.email, formData.password);
      } else {
        response = await loginWithEmail(formData.email, formData.password);
      }
      
      const userData = {
        id: response.user?.id,
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        authMethod: 'email',
        token: response.access_token
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(type === 'login' ? 'Login successful! 🎉' : 'Account created! 🎉');
      
      // Ask to set up offline PIN
      if (onPinSetup && !hasOfflineAccess()) {
        setTimeout(() => {
          onPinSetup(userData);
        }, 1500);
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {offlineMode ? 'Offline Login' : (type === 'login' ? 'Welcome Back' : 'Create Account')}
            </h2>
          </div>

          {/* Offline Mode Toggle */}
          {hasOffline && (
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setOfflineMode(false)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  !offlineMode
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <Wifi className="w-4 h-4 inline mr-1" />
                Online
              </button>
              <button
                onClick={() => setOfflineMode(true)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  offlineMode
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <WifiOff className="w-4 h-4 inline mr-1" />
                Offline
              </button>
            </div>
          )}

          {offlineMode ? (
            /* Offline PIN Login */
            <div className="space-y-4">
              {offlineUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Logging in as:</strong> {offlineUser.name}
                  </p>
                  <p className="text-xs text-blue-600">{offlineUser.email}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Enter your PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  value={offlinePin}
                  onChange={(e) => setOfflinePin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={(e) => e.key === 'Enter' && handleOfflinePinLogin()}
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleOfflinePinLogin}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <WifiOff className="w-5 h-5 inline mr-2" />
                    Login Offline
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Online Login */
            <>
              {/* Google Sign In */}
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text={type === 'login' ? 'signin_with' : 'signup_with'}
                  width="100%"
                />
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-4">
                {type === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-4">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={onToggleType}
                  className="text-orange-500 font-semibold hover:underline"
                  disabled={loading}
                >
                  {type === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;