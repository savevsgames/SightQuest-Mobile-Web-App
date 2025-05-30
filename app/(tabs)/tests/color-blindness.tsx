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
import IshiharaPlate from '@/components/color-blindness/IshiharaPlate';

type PlateType = 'demonstration' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'hidden';

const COLOR_TEST_PLATES = [
  {
    id: 1,
    digit: '12',
    type: 'demonstration' as PlateType,
    correctAnswer: '12',
    deficientAnswers: {},
    description: 'Control plate - should be visible to everyone',
  },
  {
    id: 2,
    type: 'protanopia' as PlateType,
    digit: '8',
    correctAnswer: '8',
    deficientAnswers: {
      protanopia: '3',
      deuteranopia: '3',
    },
    description: 'Tests for red-green color blindness',
  },
  {
    id: 3,
    type: 'deuteranopia' as PlateType,
    digit: '6',
    correctAnswer: '6',
    deficientAnswers: {
      protanopia: '5',
      deuteranopia: '5',
    },
    description: 'Tests for green color blindness',
  },
  {
    id: 4,
    type: 'tritanopia' as PlateType,
    digit: '29',
    correctAnswer: '29',
    deficientAnswers: {
      tritanopia: '70',
    },
    description: 'Tests for blue-yellow color blindness',
  },
  {
    id: 5,
    type: 'hidden' as PlateType,
    digit: '15',
    correctAnswer: '15',
    deficientAnswers: {
      protanopia: null,
      deuteranopia: null,
    },
    description: 'Hidden digit plate - only visible to normal vision',
  },
];

type TestAnswer = {
  plateId: number;
  userAnswer: string;
  correctAnswer: string;
  type: string;
  responseTime: number;
};

export default function ColorBlindnessTest() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const inputRef = useRef<TextInput>(null);
  const [testStatus, setTestStatus] = useState<
    'ready' | 'running' | 'complete'
  >('ready');
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

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

  const calculateMetrics = (testAnswers: TestAnswer[]) => {
    const totalResponses = testAnswers.length;
    const correctAnswers = testAnswers.filter(
      (a) => a.userAnswer === a.correctAnswer
    ).length;
    const accuracy = (correctAnswers / totalResponses) * 100;
    const averageResponseTime =
      testAnswers.reduce((acc, curr) => acc + curr.responseTime, 0) /
      totalResponses;

    const deficiencyIndicators = {
      protanopia: 0,
      deuteranopia: 0,
      tritanopia: 0,
    };

    testAnswers.forEach((answer) => {
      const plate = COLOR_TEST_PLATES.find((p) => p.id === answer.plateId);
      if (plate?.deficientAnswers) {
        if (answer.userAnswer === plate.deficientAnswers.protanopia) {
          deficiencyIndicators.protanopia++;
        }
        if (answer.userAnswer === plate.deficientAnswers.deuteranopia) {
          deficiencyIndicators.deuteranopia++;
        }
        if (answer.userAnswer === plate.deficientAnswers.tritanopia) {
          deficiencyIndicators.tritanopia++;
        }
      }
    });

    return {
      accuracy,
      averageResponseTime,
      deficiencyIndicators,
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
        test_type: 'color_blindness',
        questions: COLOR_TEST_PLATES.map((plate) => ({
          id: plate.id,
          type: plate.type,
          correctAnswer: plate.correctAnswer,
        })),
        answers: answers,
        correct_answers: COLOR_TEST_PLATES.map((plate) => plate.correctAnswer),
        metrics: metrics,
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
    setTestStatus('running');
    setCurrentPlateIndex(0);
    setAnswers([]);
    startTimeRef.current = Date.now();
    setError(null);
    inputRef.current?.focus();
  };

  const handleInput = async (text: string) => {
    if (testStatus !== 'running' || !text) return;

    const currentPlate = COLOR_TEST_PLATES[currentPlateIndex];
    const responseTime = Date.now() - startTimeRef.current;

    const answer: TestAnswer = {
      plateId: currentPlate.id,
      userAnswer: text.trim(),
      correctAnswer: currentPlate.correctAnswer,
      type: currentPlate.type,
      responseTime,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentPlateIndex < COLOR_TEST_PLATES.length - 1) {
      setCurrentPlateIndex((prev) => prev + 1);
      startTimeRef.current = Date.now();
    } else {
      setTestStatus('complete');
      const metrics = calculateMetrics(newAnswers);
      await saveTestResult(newAnswers, metrics);
    }

    if (inputRef.current) {
      inputRef.current.clear();
    }
  };

  const getDeficiencyResult = (metrics: any) => {
    const { deficiencyIndicators } = metrics;
    const threshold = COLOR_TEST_PLATES.length * 0.3;

    const results = [];
    if (deficiencyIndicators.protanopia > threshold) {
      results.push('Red-blindness (Protanopia)');
    }
    if (deficiencyIndicators.deuteranopia > threshold) {
      results.push('Green-blindness (Deuteranopia)');
    }
    if (deficiencyIndicators.tritanopia > threshold) {
      results.push('Blue-yellow-blindness (Tritanopia)');
    }

    return results.length > 0
      ? `Potential ${results.join(' and ')} detected`
      : 'No significant color vision deficiency detected';
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
          Color Vision Test
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
              Color Vision Test
            </Text>
            <Text
              style={[styles.instructionsText, { color: theme.textSecondary }]}
            >
              You will be shown a series of plates containing numbers. Enter the
              number you see in each plate. If you cannot see a number, enter 0.
              This test helps identify potential color vision deficiencies.
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

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={startTest}
            >
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {testStatus === 'running' && (
          <View style={styles.testContainer}>
            <IshiharaPlate
              digit={COLOR_TEST_PLATES[currentPlateIndex].digit}
              type={COLOR_TEST_PLATES[currentPlateIndex].type}
              size={300}
            />
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
              maxLength={2}
              keyboardType="number-pad"
              onChangeText={handleInput}
              autoFocus
              placeholder="Enter the number you see (0 if none)"
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.progress, { color: theme.textSecondary }]}>
              Plate {currentPlateIndex + 1} of {COLOR_TEST_PLATES.length}
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
                      styles.resultCard,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Text
                      style={[styles.resultCardTitle, { color: theme.text }]}
                    >
                      Analysis
                    </Text>
                    <Text
                      style={[
                        styles.resultCardText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {getDeficiencyResult(calculateMetrics(answers))}
                    </Text>
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
                        Plate
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Your Answer
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Correct
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
                          answer.userAnswer === answer.correctAnswer && {
                            backgroundColor: isDark
                              ? 'rgba(34, 197, 94, 0.1)'
                              : '#F0FDF4',
                          },
                        ]}
                      >
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {index + 1}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.userAnswer}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.correctAnswer}
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

                  <Text
                    style={[styles.disclaimer2, { color: theme.textSecondary }]}
                  >
                    Note: This test is for screening purposes only. Please
                    consult an eye care professional for a complete color vision
                    evaluation and diagnosis.
                  </Text>
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
    marginBottom: 24,
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
  resultCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  resultCardText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
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
  disclaimer2: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
});
