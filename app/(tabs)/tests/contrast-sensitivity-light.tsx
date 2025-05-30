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
import ContrastTestCard from '@/components/ContrastTestCard';

const CONTRAST_LEVELS = [100, 75, 50, 25, 12.5, 6.25, 3.125, 1.5625];
const NUM_TEST_LETTERS = 10;
const MAX_REVERSALS = 6;
const STEP_SIZE = 1;
const SLOAN_LETTERS = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];

type TestAnswer = {
  letter: string;
  userAnswer: string | null;
  responseTime: number;
  contrastLevel: number;
};

export default function ContrastSensitivityLightTest() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const inputRef = useRef<TextInput>(null);
  const [testStatus, setTestStatus] = useState<
    'ready' | 'running' | 'complete'
  >('ready');
  const [currentLetter, setCurrentLetter] = useState('');
  const [currentContrastIndex, setCurrentContrastIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reversals, setReversals] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null
  );
  const startTimeRef = useRef<number>(0);
  const [testLetters] = useState(() =>
    Array.from(
      { length: NUM_TEST_LETTERS },
      () => SLOAN_LETTERS[Math.floor(Math.random() * SLOAN_LETTERS.length)]
    )
  );

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
    const averageResponseTime =
      testAnswers.reduce((acc, curr) => acc + curr.responseTime, 0) /
      totalResponses;
    const correctAnswers = testAnswers.filter(
      (a) => a.letter === a.userAnswer
    ).length;
    const accuracy = (correctAnswers / totalResponses) * 100;
    const lowestContrastLevel = Math.min(
      ...testAnswers
        .filter((a) => a.letter === a.userAnswer)
        .map((a) => a.contrastLevel)
    );

    return {
      averageResponseTime,
      accuracy,
      lowestContrastLevel,
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
        test_type: 'contrast_sensitivity_light',
        questions: testLetters,
        answers: answers,
        correct_answers: testLetters,
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
    setCurrentLetterIndex(0);
    setCurrentContrastIndex(0);
    setAnswers([]);
    setCurrentLetter(testLetters[0]);
    setReversals(0);
    setLastAnswerCorrect(null);
    startTimeRef.current = Date.now();
    setError(null);
    inputRef.current?.focus();
  };

  const handleInput = async (text: string) => {
    if (testStatus !== 'running' || !text) return;

    const responseTime = Date.now() - startTimeRef.current;
    const currentContrast = CONTRAST_LEVELS[currentContrastIndex];
    const isCorrect = text.toUpperCase() === currentLetter;

    const answer: TestAnswer = {
      letter: currentLetter,
      userAnswer: text.toUpperCase(),
      responseTime,
      contrastLevel: currentContrast,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (lastAnswerCorrect !== null && isCorrect !== lastAnswerCorrect) {
      setReversals((prev) => prev + 1);
    }
    setLastAnswerCorrect(isCorrect);

    if (reversals >= MAX_REVERSALS) {
      setTestStatus('complete');
      const metrics = calculateMetrics(newAnswers);
      await saveTestResult(newAnswers, metrics);
      return;
    }

    if (isCorrect) {
      if (currentContrastIndex < CONTRAST_LEVELS.length - STEP_SIZE) {
        setCurrentContrastIndex((prev) => prev + STEP_SIZE);
      }
    } else {
      if (currentContrastIndex >= STEP_SIZE) {
        setCurrentContrastIndex((prev) => prev - STEP_SIZE);
      }
    }

    if (currentLetterIndex < testLetters.length - 1) {
      setCurrentLetterIndex((prev) => prev + 1);
      setCurrentLetter(testLetters[currentLetterIndex + 1]);
    } else {
      setTestStatus('complete');
      const metrics = calculateMetrics(newAnswers);
      await saveTestResult(newAnswers, metrics);
      return;
    }

    startTimeRef.current = Date.now();

    if (inputRef.current) {
      inputRef.current.clear();
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
          Light Contrast Test
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {testStatus === 'ready' && (
          <View style={styles.instructionsContainer}>
            <Feather name="eye" size={48} color={theme.primary} />
            <Text style={[styles.instructionsTitle, { color: theme.text }]}>
              Light Contrast Test
            </Text>
            <Text
              style={[styles.instructionsText, { color: theme.textSecondary }]}
            >
              Letters will appear in varying contrast levels on a light
              background. Type each letter as soon as you can read it. This test
              measures your ability to detect subtle differences in contrast
              against a light background.
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
          </View>
        )}

        {testStatus === 'running' && (
          <View style={styles.testContainer}>
            <ContrastTestCard
              letter={currentLetter}
              contrastLevel={CONTRAST_LEVELS[currentContrastIndex]}
              isDarkTest={false}
              onAnswer={handleInput}
              inputRef={inputRef}
              letterCount={currentLetterIndex + 1}
              totalLetters={NUM_TEST_LETTERS}
            />
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
                        {calculateMetrics(answers).lowestContrastLevel}%
                      </Text>
                      <Text
                        style={[
                          styles.metricLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Min. Contrast
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
                        Time
                      </Text>
                      <Text
                        style={[
                          styles.tableHeaderText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Contrast
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
                          {answer.userAnswer || '-'}
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.responseTime}ms
                        </Text>
                        <Text style={[styles.tableCell, { color: theme.text }]}>
                          {answer.contrastLevel}%
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
    paddingBottom: 40,
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
