import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, colors } from '@/contexts/ThemeContext';

type DateRange = '1m' | '1y' | '5y' | 'all';

type DateRangeSelectorProps = {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
};

export default function DateRangeSelector({
  selectedRange,
  onRangeChange
}: DateRangeSelectorProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.dateRangeContainer}>
      <TouchableOpacity
        style={[
          styles.dateRangeButton,
          selectedRange === '1m' && { backgroundColor: theme.primary }
        ]}
        onPress={() => onRangeChange('1m')}
      >
        <Text style={[
          styles.dateRangeButtonText,
          selectedRange === '1m' && styles.dateRangeButtonTextActive
        ]}>1M</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.dateRangeButton,
          selectedRange === '1y' && { backgroundColor: theme.primary }
        ]}
        onPress={() => onRangeChange('1y')}
      >
        <Text style={[
          styles.dateRangeButtonText,
          selectedRange === '1y' && styles.dateRangeButtonTextActive
        ]}>1Y</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.dateRangeButton,
          selectedRange === '5y' && { backgroundColor: theme.primary }
        ]}
        onPress={() => onRangeChange('5y')}
      >
        <Text style={[
          styles.dateRangeButtonText,
          selectedRange === '5y' && styles.dateRangeButtonTextActive
        ]}>5Y</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.dateRangeButton,
          selectedRange === 'all' && { backgroundColor: theme.primary }
        ]}
        onPress={() => onRangeChange('all')}
      >
        <Text style={[
          styles.dateRangeButtonText,
          selectedRange === 'all' && styles.dateRangeButtonTextActive
        ]}>All</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  dateRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  dateRangeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  dateRangeButtonTextActive: {
    color: '#FFFFFF',
  },
});