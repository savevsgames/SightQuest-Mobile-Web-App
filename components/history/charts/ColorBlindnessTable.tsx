import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useTheme, colors } from '@/contexts/ThemeContext';

type TestResult = {
  id: string;
  created_at: string;
  metrics: {
    deficiencyIndicators?: {
      protanopia: number;
      deuteranopia: number;
      tritanopia: number;
    };
  };
};

type Props = {
  results: TestResult[];
};

export default function ColorBlindnessTable({ results }: Props) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const getDeficiencyText = (indicators?: { [key: string]: number }) => {
    if (!indicators) return 'No data';

    const deficiencies = [];
    if (indicators.protanopia > 0) deficiencies.push('Protanopia');
    if (indicators.deuteranopia > 0) deficiencies.push('Deuteranopia');
    if (indicators.tritanopia > 0) deficiencies.push('Tritanopia');

    return deficiencies.length > 0 ? deficiencies.join(', ') : 'None detected';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: isDark ? theme.background : '#F1F5F9' }]}>
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>Date</Text>
        <Text style={[styles.headerText, { color: theme.textSecondary }]}>Deficiencies</Text>
      </View>
      {results.map((result) => (
        <View 
          key={result.id} 
          style={[styles.row, { borderBottomColor: theme.border }]}
        >
          <Text style={[styles.cell, { color: theme.text }]}>
            {format(parseISO(result.created_at), 'MMM dd, yyyy')}
          </Text>
          <Text style={[styles.cell, { color: theme.text }]}>
            {getDeficiencyText(result.metrics.deficiencyIndicators)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 12,
  },
  headerText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  cell: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});