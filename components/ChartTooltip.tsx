import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/contexts/ThemeContext';

type ChartTooltipProps = {
  x: number;
  y: number;
  visible: boolean;
  isDark: boolean;
  data: {
    date: string;
    value: number;
    accuracy: number;
    responseTime: number;
    testType: 'letter_acuity' | 'contrast_sensitivity' | 'color_blindness';
  };
};

const formatValue = (value: number, testType: string) => {
  if (testType === 'letter_acuity') {
    return `20/${Math.round(20 / value)}`;
  } else {
    return `${value.toFixed(1)}%`;
  }
};

export default function ChartTooltip({ x, y, visible, isDark, data }: ChartTooltipProps) {
  if (!visible) return null;

  const theme = isDark ? colors.dark : colors.light;

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.surface,
          borderColor: theme.border,
          transform: [
            { translateX: x - 100 },
            { translateY: y - 120 }
          ]
        }
      ]}
    >
      <Text style={[styles.date, { color: theme.textSecondary }]}>{data.date}</Text>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {data.testType === 'letter_acuity' ? 'Visual Acuity:' : 'Score:'}
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {formatValue(data.value, data.testType)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Accuracy:</Text>
        <Text style={[styles.value, { color: theme.text }]}>{data.accuracy.toFixed(1)}%</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Response Time:</Text>
        <Text style={[styles.value, { color: theme.text }]}>{Math.round(data.responseTime)}ms</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
  },
  date: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  value: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});