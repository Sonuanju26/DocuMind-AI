import React, { useState } from 'react';
import { Lock, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveOfflineUser } from '../utils/offlineAuth';
import { setupOfflinePin } from '../services/apiService';

const PinSetupModal = ({ user, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      // Save to backend
      await setupOfflinePin(user.email, pin);
      
      // Save locally
      saveOfflineUser(user, pin);
      
      toast.success('Offline access enabled! 🔒');
      onSuccess();
    } catch (error) {
      console.error('PIN setup error:', error);
      toast.error(error.message || 'Failed to setup offline PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enable Offline Access</h2>
            <p className="text-sm text-gray-500">Set up a PIN for offline login</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Create PIN (4-6 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Shield className="w-4 h-4 inline mr-1" />
              <strong>Offline Mode:</strong> You'll be able to access the app without internet by entering this PIN.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!pin || !confirmPin || loading}
            className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Enable Offline Access'}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinSetupModal;