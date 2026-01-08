// Offline Authentication Utilities

// Generate hash for PIN (simple encryption)
const hashPin = (pin) => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// Save user with PIN
export const saveOfflineUser = (userData, pin) => {
  const hashedPin = hashPin(pin);
  
  const offlineUser = {
    ...userData,
    pin: hashedPin,
    savedAt: new Date().toISOString(),
    offlineEnabled: true
  };
  
  localStorage.setItem('offline_user', JSON.stringify(offlineUser));
  return true;
};

// Verify PIN for offline login
export const verifyOfflinePin = (pin) => {
  try {
    const storedUser = localStorage.getItem('offline_user');
    if (!storedUser) return null;
    
    const user = JSON.parse(storedUser);
    const hashedPin = hashPin(pin);
    
    if (user.pin === hashedPin) {
      return {
        name: user.name,
        email: user.email,
        picture: user.picture,
        authMethod: 'offline'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Offline verification error:', error);
    return null;
  }
};

// Check if offline login is available
export const hasOfflineAccess = () => {
  const offlineUser = localStorage.getItem('offline_user');
  return !!offlineUser;
};

// Remove offline access
export const removeOfflineAccess = () => {
  localStorage.removeItem('offline_user');
};

// Get stored offline user info (without logging in)
export const getOfflineUserInfo = () => {
  try {
    const stored = localStorage.getItem('offline_user');
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    return {
      name: user.name,
      email: user.email,
      picture: user.picture
    };
  } catch {
    return null;
  }
};