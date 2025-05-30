import React, { createContext, useState, useContext } from 'react';

// Define feature flag types
type FeatureFlags = {
  isPro: boolean;
  // Add more feature flags as needed
};

// Feature flag context type
type FeatureFlagContextType = {
  flags: FeatureFlags;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
};

// Default values for feature flags
const defaultFlags: FeatureFlags = {
  isPro: true, // Default to true as per requirements
};

// Create the context
const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: defaultFlags,
  setFlag: () => {},
});

// Provider component
export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  const setFlag = (flag: keyof FeatureFlags, value: boolean) => {
    setFlags(prevFlags => ({
      ...prevFlags,
      [flag]: value,
    }));
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Custom hook to use the feature flag context
export const useFeatureFlags = () => useContext(FeatureFlagContext);

export default FeatureFlagProvider;