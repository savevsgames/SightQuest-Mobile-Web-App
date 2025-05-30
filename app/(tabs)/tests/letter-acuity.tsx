import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../../supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, colors } from '@/contexts/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useCalibratedPPI } from '@/hooks/useCalibratedPPI';
import PPIDisplay from '@/components/letterAcuity/PPIDisplay';

const SNELLEN_STEPS = [200, 100, 80, 60, 40, 30, 25, 20, 15, 10, 5];
const VIEWING_DISTANCE_INCHES = 18;
const STANDARD_ANGLE = 5;
const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];

type TestAnswer = {
  letter: string;
  userAnswer: string;
  responseTime: number;
  pixelSize: number;
  snellenScore: number;
};

export default function LetterAcuityTest() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const ppi = useCalibratedPPI();

  const inputRef = useRef<TextInput>(null);
  const startTimeRef = useRef<number>(0);

  const [testStatus, setTestStatus] = useState<
    'ready' | 'running' | 'complete'
  >('ready');
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [snellenIndex, setSnellenIndex] = useState(0);
  const [currentSnellen, setCurrentSnellen] = useState(SNELLEN_STEPS[0]);
  const [currentLetter, setCurrentLetter] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          inputRef.current?.focus();
        }
      );

      return () => {
        keyboardDidHideListener.remove();
      };
    }
  }, []);

  const calculateLetterPixelSize = (snellenDenominator: number) => {
    if (!ppi) return 0;

    const distanceInches = VIEWING_DISTANCE_INCHES;
    const angleRadians = (STANDARD_ANGLE * Math.PI) / (180 * 60);
    const sizeInches =
      distanceInches * Math.tan(angleRadians) * (snellenDenominator / 20);
    return Math.round(sizeInches * ppi);
  };

  const calculateSnellenFromPixels = (pixelSize: number) => {
    if (!ppi) return 0;
    const sizeInches = pixelSize / ppi;
    const distanceInches = VIEWING_DISTANCE_INCHES;
    const angleRadians = Math.atan(sizeInches / distanceInches);
    const angleMins = (angleRadians * 180 * 60) / Math.PI;
    return Math.round((angleMins / STANDARD_ANGLE) * 20);
  };

  const calculateMetrics = (testAnswers: TestAnswer[]) => {
    const totalResponses = testAnswers.length;
    const averageResponseTime =
      testAnswers.reduce((acc, curr) => acc + curr.responseTime, 0) /
      totalResponses;
    const correctAnswers = testAnswers.filter(
      (a) => a.letter === a.userAnswer
    ).length;
    const accuracy = (correctAnswers / totalResponses) * 100;

    const correctSnellenScores = testAnswers
      .filter((a) => a.letter === a.userAnswer)
      .map((a) => a.snellenScore);

    const bestSnellenScore =
      correctSnellenScores.length > 0
        ? Math.min(...correctSnellenScores)
        : SNELLEN_STEPS[0];

    const acuityIndex = 20 / bestSnellenScore;

    return {
      averageResponseTime,
      accuracy,
      bestSnellenScore,
      acuityIndex,
    };
  };

  const saveTestResult = async (answers: TestAnswer[], metrics: any) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase.from('tests').insert({
        user_id: user.id,
        test_type: 'letter_acuity',
        questions: answers.map((a) => a.letter),
        answers,
        correct_answers: answers.map((a) => a.letter),
        metrics: {
          accuracy: metrics.accuracy,
          averageSnellen: metrics.bestSnellenScore,
          acuityIndex: metrics.acuityIndex,
          averageResponseTime: metrics.averageResponseTime,
        },
        acuity_index: metrics.acuityIndex,
        average_response_time: metrics.averageResponseTime,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving test result:', error);
      setError('Failed to save test results. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const startTest = () => {
    if (!ppi) {
      setError('Please calibrate your screen before starting the test');
      return;
    }

    setTestStatus('running');
    setAnswers([]);
    setSnellenIndex(0);
    setCurrentSnellen(SNELLEN_STEPS[0]);
    setCurrentLetter(
      SLOAN_LETTERS[Math.floor(Math.random() * SLOAN_LETTERS.length)]
    );
    setAttemptsLeft(1);
    setError(null);
    inputRef.current?.focus();
    startTimeRef.current = Date.now();
  };

  const handleCalibrate = () => {
    router.push('/(tabs)/settings/calibration');
  };

  const finishTest = async (finalAnswers: TestAnswer[]) => {
    setTestStatus('complete');
    const metrics = calculateMetrics(finalAnswers);
    await saveTestResult(finalAnswers, metrics);
  };

  const handleInput = async (text: string) => {
    if (testStatus !== 'running' || !text) return;

    const responseTime = Date.now() - startTimeRef.current;
    const userAnswer = text.toUpperCase();
    const correct = userAnswer === currentLetter;
    const pixelSize = calculateLetterPixelSize(currentSnellen);
    const snellenScore = calculateSnellenFromPixels(pixelSize);

    const answer: TestAnswer = {
      letter: currentLetter,
      userAnswer,
      responseTime,
      pixelSize,
      snellenScore,
    };

    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (correct) {
      if (snellenIndex < SNELLEN_STEPS.length - 1) {
        const nextIndex = snellenIndex + 1;
        setSnellenIndex(nextIndex);
        setCurrentSnellen(SNELLEN_STEPS[nextIndex]);
        setCurrentLetter(
          SLOAN_LETTERS[Math.floor(Math.random() * SLOAN_LETTERS.length)]
        );
        setAttemptsLeft(1);
        inputRef.current?.clear();
        startTimeRef.current = Date.now();
      } else {
        await finishTest(updatedAnswers);
      }
    } else if (attemptsLeft > 0) {
      setAttemptsLeft(0);
      inputRef.current?.clear();
      startTimeRef.current = Date.now();
    } else {
      await finishTest(updatedAnswers);
    }
  };

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
          <Feather name="arrow-left" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          Letter Acuity Test
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {testStatus === 'ready' && (
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.instructionsContainer}
          >
            <Feather name="eye" size={48} color={theme.primary} />
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>
              Test Instructions
            </Text>
            <Text
              style={[styles.instructionsText, { color: theme.textSecondary }]}
            >
              Letters will appear in different sizes. Type each letter as soon
              as you can read it. The test measures your visual acuity at
              different sizes.
            </Text>

            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : '#FEE2E2',
                },
              ]}
            >
              <Text style={[styles.warningText, { color: theme.error }]}>
                This is a screening test only and does not replace a
                professional eye examination. Please consult an eye care
                professional for a complete evaluation.
              </Text>
            </View>

            <PPIDisplay ppi={ppi} />

            {!ppi && (
              <View
                style={[
                  styles.calibrationWarning,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.1)'
                      : '#FEF3C7',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.calibrationWarningText,
                    { color: theme.warning },
                  ]}
                >
                  ⚠️ Your screen hasn't been calibrated. Results may be
                  inaccurate.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.calibrateButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleCalibrate}
            >
              <Feather name="settings" size={20} color="#FFFFFF" />
              <Text style={styles.calibrateButtonText}>
                {ppi ? 'Re-calibrate Screen' : 'Calibrate Screen'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.startButton,
                { backgroundColor: theme.primary },
                !ppi && { opacity: 0.5 },
              ]}
              onPress={startTest}
              disabled={!ppi}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {testStatus === 'running' && (
          <View style={styles.testContainer}>
            <Text
              style={[
                styles.letter,
                {
                  fontSize: calculateLetterPixelSize(currentSnellen),
                  color: theme.text,
                  fontFamily: Platform.select({
                    web: 'monospace',
                    default: 'Inter-Bold',
                  }),
                },
              ]}
            >
              {currentLetter}
            </Text>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              maxLength={1}
              autoCapitalize="characters"
              autoCorrect={false}
              onChangeText={handleInput}
              autoFocus
              keyboardType="default"
              placeholder="Type the letter you see"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.progress, { color: theme.textSecondary }]}>
              Snellen Score: 20/{currentSnellen}
            </Text>
          </View>
        )}

        {testStatus === 'complete' && (
          <ScrollView
            style={styles.resultScrollView}
            contentContainerStyle={styles.resultScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultContainer}>
              {error ? (
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
                  <TouchableOpacity
                    style={[
                      styles.retryButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={startTest}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>
                    {isSaving ? 'Saving Results...' : 'Test Complete!'}
                  </Text>

                  <View style={styles.metricsGrid}>
                    <View
                      style={[
                        styles.metricCard,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <Feather name="target" size={24} color={theme.primary} />
                      <Text style={[styles.metricValue, { color: theme.text }]}>
                        {calculateMetrics(answers).accuracy.toFixed(1)}%
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Accuracy
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <Feather name="eye" size={24} color={theme.primary} />
                      <Text style={[styles.metricValue, { color: theme.text }]}>
                        20/{calculateMetrics(answers).bestSnellenScore}
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Best Score
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.metricCard,
                        { backgroundColor: theme.surface },
                      ]}
                    >
                      <Feather name="clock" size={24} color={theme.primary} />
                      <Text style={[styles.metricValue, { color: theme.text }]}>
                        {Math.round(
                          calculateMetrics(answers).averageResponseTime
                        )}
                        ms
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Avg. Time
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.resultsTable,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <View
                      style={[
                        styles.tableHeader,
                        {
                          backgroundColor: isDark
                            ? theme.background
                            : '#F1F5F9',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Letter
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Answer
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Score
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Time
                      </Text>
                    </View>
                    {answers.map((answer, index) => (
                      <View
                        key={index}
                        style={[
                          styles.tableRow,
                          { borderBottomColor: theme.border },
                          answer.letter === answer.userAnswer && {
                            backgroundColor: isDark
                              ? 'rgba(34, 197, 94, 0.1)'
                              : '#F0FDF4',
                          },
                        ]}
                      >
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.letter}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.userAnswer}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          20/{answer.snellenScore}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.responseTime}ms
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.retryButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={startTest}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>
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
  content: {
    flex: 1,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  instructionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  instructionsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  calibrationWarning: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  calibrationWarningText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  calibrationLink: {
    textDecorationLine: 'underline',
  },
  calibrationIndicator: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  testContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  letter: {
    fontFamily: Platform.select({ web: 'monospace', default: 'Inter-Bold' }),
    marginBottom: 48,
  },
  input: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  progress: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 16,
  },
  resultContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  resultTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 24,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  metricLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  resultsTable: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  tableHeaderText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 12,
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultScrollView: {
    flex: 1,
  },
  resultScrollContent: {
    flexGrow: 1,
  },
  calibrateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calibrateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  warningBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  warningText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
