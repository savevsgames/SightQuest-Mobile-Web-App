import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { useTheme, colors } from '@/contexts/ThemeContext';
import LetterAcuityChart from './charts/LetterAcuityChart';
import ContrastSensitivityChart from './charts/ContrastSensitivityChart';
import ColorBlindnessTable from './charts/ColorBlindnessTable';

type TestResult = {
  id: string;
  created_at: string;
  metrics: {
    accuracy?: number;
    averageSnellen?: number;
    lowestContrastLevel?: number;
    deficiencyIndicators?: {
      protanopia: number;
      deuteranopia: number;
      tritanopia: number;
    };
  };
};

type TestResultsListProps = {
  results: TestResult[];
  testType: string;
  onDelete: (id: string) => void;
};

export default function TestResultsList({
  results,
  testType,
  onDelete,
}: TestResultsListProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const getTestResultSummary = (test: TestResult) => {
    if (!test?.metrics) {
      return 'No metrics available';
    }

    switch (testType) {
      case 'letter_acuity':
        return `Visual Acuity: 20/${Math.round(
          test.metrics.averageSnellen ?? 0
        )}`;
      case 'contrast_sensitivity_light':
      case 'contrast_sensitivity_dark':
        return `Contrast Level: ${test.metrics.lowestContrastLevel ?? 0}%`;
      case 'color_blindness':
        const indicators = test.metrics.deficiencyIndicators;
        if (!indicators) return 'Score: N/A';

        const deficiencies = [];
        if (indicators.protanopia > 0) deficiencies.push('Protanopia');
        if (indicators.deuteranopia > 0) deficiencies.push('Deuteranopia');
        if (indicators.tritanopia > 0) deficiencies.push('Tritanopia');

        return deficiencies.length > 0
          ? `Potential: ${deficiencies.join(', ')}`
          : 'No deficiency detected';
      default:
        return 'No data available';
    }
  };

  const renderChart = () => {
    if (results.length === 0) return null;

    switch (testType) {
      case 'letter_acuity':
        return <LetterAcuityChart results={results} />;
      case 'contrast_sensitivity_light':
      case 'contrast_sensitivity_dark':
        return <ContrastSensitivityChart results={results} />;
      case 'color_blindness':
        return <ColorBlindnessTable results={results} />;
      default:
        return null;
    }
  };

  const formatAccuracy = (test: TestResult): string => {
    if (!test?.metrics?.accuracy && test?.metrics?.accuracy !== 0) {
      return '0.0';
    }
    return test.metrics.accuracy.toFixed(1);
  };

  return (
    <View style={styles.container}>
      {renderChart()}

      <View style={styles.testList}>
        {results.map((test, testIndex) => (
          <TouchableOpacity
            key={test.id}
            style={[
              styles.testItem,
              { backgroundColor: isDark ? theme.background : '#F8FAFC' },
            ]}
          >
            <View style={styles.testItemHeader}>
              <Text style={[styles.testItemTitle, { color: theme.primary }]}>
                Test #{results.length - testIndex}
              </Text>
              <View style={styles.testItemActions}>
                <Text
                  style={[styles.testItemDate, { color: theme.textSecondary }]}
                >
                  {format(parseISO(test.created_at), 'MMM dd, yyyy')}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDelete(test.id)}
                >
                  <Feather name="trash-2" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.testItemMetrics}>
              <Text style={[styles.metricText, { color: theme.text }]}>
                {getTestResultSummary(test)}
              </Text>
              <Text style={[styles.metricText, { color: theme.text }]}>
                Accuracy: {formatAccuracy(test)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testList: {
    marginTop: 16,
  },
  testItem: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  testItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testItemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  testItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testItemDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  testItemMetrics: {
    gap: 4,
  },
  metricText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});
