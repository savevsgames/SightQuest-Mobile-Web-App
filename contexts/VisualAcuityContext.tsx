import React, { createContext, useContext } from 'react';
import { Dimensions, PixelRatio, Platform } from 'react-native';

// Sloan letters are the standard for visual acuity testing
const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];

// Standard viewing distance in millimeters (40cm)
const STANDARD_DISTANCE_MM = 400;

// The angle for 20/20 vision in minutes of arc (5 arcminutes)
const STANDARD_ANGLE = 5;

type VisualAcuityContextType = {
  calculateOptotypeSize: (snellenDenominator: number) => number;
  getRandomSloanLetter: () => string;
  convertPixelsToSnellen: (pixelSize: number) => number;
  getScreenPPI: () => number;
};

const VisualAcuityContext = createContext<VisualAcuityContextType>({
  calculateOptotypeSize: () => 0,
  getRandomSloanLetter: () => '',
  convertPixelsToSnellen: () => 0,
  getScreenPPI: () => 0,
});

export const VisualAcuityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get device pixel ratio and screen dimensions
  const pixelRatio = PixelRatio.get();
  const screen = Dimensions.get('window');

  // Calculate screen PPI (pixels per inch)
  const getScreenPPI = () => {
    // For web, use a standard 96 DPI
    if (Platform.OS === 'web') {
      return 96;
    }

    // For mobile devices, calculate based on screen dimensions and pixel ratio
    const diagonalPixels = Math.sqrt(
      Math.pow(screen.width * pixelRatio, 2) + 
      Math.pow(screen.height * pixelRatio, 2)
    );

    // Approximate diagonal size in inches (based on average device sizes)
    const diagonalInches = Platform.OS === 'ios' ? 5.5 : 6.0;

    return diagonalPixels / diagonalInches;
  };

  // Calculate optotype size in pixels for a given Snellen denominator
  const calculateOptotypeSize = (snellenDenominator: number) => {
    // Convert standard viewing distance to inches
    const distanceInches = STANDARD_DISTANCE_MM / 25.4;

    // Calculate the size based on the 5 arcminute standard
    const sizeInches = (distanceInches * Math.tan(STANDARD_ANGLE * Math.PI / (180 * 60))) * 
      (snellenDenominator / 20);

    // Convert to pixels using screen PPI
    return Math.round(sizeInches * getScreenPPI());
  };

  // Get a random Sloan letter
  const getRandomSloanLetter = () => {
    return SLOAN_LETTERS[Math.floor(Math.random() * SLOAN_LETTERS.length)];
  };

  // Convert pixel size to Snellen denominator
  const convertPixelsToSnellen = (pixelSize: number) => {
    const ppi = getScreenPPI();
    const sizeInches = pixelSize / ppi;
    const distanceInches = STANDARD_DISTANCE_MM / 25.4;
    const angle = Math.atan(sizeInches / distanceInches) * (180 * 60) / Math.PI;
    return Math.round((angle / STANDARD_ANGLE) * 20);
  };

  return (
    <VisualAcuityContext.Provider value={{
      calculateOptotypeSize,
      getRandomSloanLetter,
      convertPixelsToSnellen,
      getScreenPPI,
    }}>
      {children}
    </VisualAcuityContext.Provider>
  );
};

export const useVisualAcuity = () => useContext(VisualAcuityContext);