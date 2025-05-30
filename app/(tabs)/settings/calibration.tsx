import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme, colors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const CARD_HEIGHT_INCHES = 3.37;
const CARD_HEIGHT_MM = 85.6;

export default function CalibrationScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { user, updateProfile } = useAuth();

  const [pixelHeight, setPixelHeight] = useState(100);
  const [ppi, setPpi] = useState(0);
  const [manualPixelHeight, setManualPixelHeight] = useState('');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePPI = useCallback(() => {
    const calculatedPPI = pixelHeight / CARD_HEIGHT_INCHES;
    console.log('Calculated PPI:', calculatedPPI);
    setPpi(calculatedPPI);
    return calculatedPPI;
  }, [pixelHeight]);

  const handleCalibration = async () => {
    try {
      setIsCalibrating(true);
      setError(null);
      const calculatedPPI = calculatePPI();
      console.log('Starting calibration with PPI:', calculatedPPI);

      if (calculatedPPI < 72 || calculatedPPI > 600) {
        throw new Error(
          'The calculated PPI seems incorrect. Please try again.'
        );
      }

      console.log('Updating profile with calibrated_ppi:', calculatedPPI);
      await updateProfile({
        calibrated_ppi: calculatedPPI,
      });

      console.log('Calibration successful');
      router.back();
    } catch (error: any) {
      console.error('Error saving calibrated PPI:', error);
      setError(
        error.message || 'Failed to save calibration. Please try again.'
      );
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleSliderChange = (value: number) => {
    setPixelHeight(value);
    console.log('Pixel height changed to:', value);
  };

  const handleManualInputChange = (text: string) => {
    setManualPixelHeight(text);
  };

  const handleManualInputSubmit = () => {
    const parsedHeight = parseFloat(manualPixelHeight);
    if (!isNaN(parsedHeight) && parsedHeight > 0) {
      console.log('Setting manual pixel height:', parsedHeight);
      setPixelHeight(parsedHeight);
    } else {
      setError('Please enter a valid number for pixel height.');
    }
  };

  // Log current user calibration status on mount
  console.log('Current user calibrated_ppi:', user?.calibrated_ppi);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          {/* ArrowLeft replaced with Feather */}
          <Feather name="arrow-left" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Screen Calibration
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.instructionTitle, { color: theme.text }]}>
              Calibrate Your Screen
            </Text>
            <Text
              style={[styles.instructionText, { color: theme.textSecondary }]}
            >
              To ensure accurate vision test results, we need to calibrate your
              screen size. Place a standard credit card vertically against your
              screen and adjust the rectangle's height to match.
            </Text>

            <View style={styles.creditCardContainer}>
              {/* CreditCard replaced with MaterialIcons */}
              <MaterialIcons
                name="credit-card"
                size={48}
                color={theme.primary}
              />
              <Text
                style={[styles.creditCardText, { color: theme.textSecondary }]}
              >
                Standard credit card dimensions:{'\n'}
                Height: {CARD_HEIGHT_MM}mm ({CARD_HEIGHT_INCHES} inches)
              </Text>
            </View>

            <View style={styles.calibrationArea}>
              <View
                style={[
                  styles.rectangle,
                  {
                    height: pixelHeight,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
              <Text
                style={[styles.pixelHeightText, { color: theme.textSecondary }]}
              >
                Height: {pixelHeight} pixels
              </Text>
              {ppi > 0 && (
                <Text style={[styles.ppiText, { color: theme.textSecondary }]}>
                  Calculated PPI: {Math.round(ppi)}
                </Text>
              )}
            </View>

            {error && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : '#FEE2E2',
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.primary }]}>
                Manual Pixel Height:
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={manualPixelHeight}
                  onChangeText={handleManualInputChange}
                  placeholder="Enter pixel height"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  onSubmitEditing={handleManualInputSubmit}
                />
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handleManualInputSubmit}
                >
                  <Text style={styles.buttonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <Text style={[styles.sliderLabel, { color: theme.primary }]}>
                Adjust Height:
              </Text>
              <input
                type="range"
                min="50"
                max="500"
                value={pixelHeight}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                style={styles.slider}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.calibrateButton,
                { backgroundColor: theme.primary },
                isCalibrating && { opacity: 0.7 },
              ]}
              onPress={handleCalibration}
              disabled={isCalibrating}
            >
              <Text style={styles.calibrateButtonText}>
                {isCalibrating ? 'Calibrating...' : 'Confirm Calibration'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  content: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  instructionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  creditCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.select({ web: '#F0F9FF', default: '#F0F9FF' }),
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  creditCardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 16,
    flex: 1,
  },
  calibrationArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rectangle: {
    width: 50,
    marginBottom: 8,
  },
  pixelHeightText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 4,
  },
  ppiText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  calibrateButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
