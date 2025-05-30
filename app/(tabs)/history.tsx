import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../supabase/client';
import { format, parseISO, subMonths, subYears, isAfter } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, colors } from '@/contexts/ThemeContext';
import BaseTestCard from '@/components/history/BaseTestCard';
import EmptyTestState from '@/components/history/EmptyTestState';
import TestResultsList from '@/components/history/TestResultsList';
import DateRangeSelector from '@/components/history/DateRangeSelector';
import ConfirmationModal from '@/components/ConfirmationModal';


type DateRange = '1m' | '1y' | '5y' | 'all';

type TestResult = {
  id: string;
  test_type: string;
  created_at: string;
  metrics: {
    accuracy: number;
    averageSnellen?: number;
    lowestContrastLevel?: number;
    deficiencyIndicators?: {
      protanopia: number;
      deuteranopia: number;
      tritanopia: number;
    };
  };
  acuity_index?: number;
  average_response_time?: number;
};

type TestSection = {
  type: string;
  title: string;
  description: string;
  results: TestResult[];
  isExpanded: boolean;
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange>('1m');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [testSections, setTestSections] = useState<TestSection[]>([
    {
      type: 'letter_acuity',
      title: 'Letter Acuity Tests',
      description: 'Track your visual acuity progress over time',
      results: [],
      isExpanded: false,
    },
    {
      type: 'contrast_sensitivity_light',
      title: 'Contrast Sensitivity Tests (Light)',
      description: 'Track your contrast sensitivity progress over time',
      results: [],
      isExpanded: false,
    },
    {
      type: 'contrast_sensitivity_dark',
      title: 'Contrast Sensitivity Tests (Dark)',
      description: 'Track your contrast sensitivity progress over time',
      results: [],
      isExpanded: false,
    },
    {
      type: 'color_blindness',
      title: 'Color Vision Tests',
      description: 'Track your color vision test results over time',
      results: [],
      isExpanded: false,
    }
  ]);

  useEffect(() => {
    if (user) {
      loadTestResults();
    }
  }, [user, selectedRange]);

  const getDateRangeStart = (range: DateRange): Date => {
    const now = new Date();
    switch (range) {
      case '1m': return subMonths(now, 1);
      case '1y': return subYears(now, 1);
      case '5y': return subYears(now, 5);
      case 'all': return new Date(0);
      default: return subMonths(now, 1);
    }
  };

  const loadTestResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rangeStart = getDateRangeStart(selectedRange);
      const filteredData = data?.filter(test => 
        isAfter(parseISO(test.created_at), rangeStart)
      ) || [];

      setTestSections(prev => 
        prev.map(section => ({
          ...section,
          results: filteredData.filter(test => test.test_type === section.type)
        }))
      );
    } catch (err: any) {
      console.error('Error loading test results:', err);
      setError('Failed to load test results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;

    try {
      setIsDeleting(true);
      setError(null);

      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testToDelete)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadTestResults();
      setDeleteModalVisible(false);
      setTestToDelete(null);
    } catch (err: any) {
      console.error('Error deleting test:', err);
      setError('Failed to delete test. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSection = (index: number) => {
    setTestSections(prev => 
      prev.map((section, i) => ({
        ...section,
        isExpanded: i === index ? !section.isExpanded : section.isExpanded
      }))
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Test History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading test history...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>Test History</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Test History</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />

        {testSections.map((section, index) => (
          <BaseTestCard
            key={section.type}
            title={section.title}
            description={section.description}
            isExpanded={section.isExpanded}
            onToggle={() => toggleSection(index)}
          >
            {section.results.length === 0 ? (
              <EmptyTestState testType={section.type} />
            ) : (
              <TestResultsList
                results={section.results}
                testType={section.type}
                onDelete={(id) => {
                  setTestToDelete(id);
                  setDeleteModalVisible(true);
                }}
              />
            )}
          </BaseTestCard>
        ))}
      </ScrollView>

      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Test Result"
        message="Are you sure you want to delete this test result? This action cannot be undone."
        onConfirm={handleDeleteTest}
        onCancel={() => {
          setDeleteModalVisible(false);
          setTestToDelete(null);
        }}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});