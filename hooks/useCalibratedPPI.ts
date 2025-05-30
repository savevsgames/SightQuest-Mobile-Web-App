import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';

const DEFAULT_WEB_PPI = 96;

export const useCalibratedPPI = () => {
  const { user } = useAuth();
  const [ppi, setPpi] = useState(DEFAULT_WEB_PPI);

  useEffect(() => {
    if (user?.calibrated_ppi) {
      setPpi(user.calibrated_ppi);
    } else if (Platform.OS === 'web') {
      setPpi(DEFAULT_WEB_PPI);
    } else {
      // Default to 96 PPI for non-calibrated devices
      setPpi(96);
    }
  }, [user]);

  return ppi;
};