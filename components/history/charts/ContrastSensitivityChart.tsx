import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { format, parseISO } from 'date-fns';
import { useTheme, colors } from '@/contexts/ThemeContext';

type TestResult = {
  id: string;
  created_at: string;
  metrics: {
    lowestContrastLevel?: number;
  };
};

type Props = {
  results: TestResult[];
};

export default function ContrastSensitivityChart({ results }: Props) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const sortedResults = [...results].sort((a, b) => 
    parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
  );

  // Calculate chart width based on number of data points
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(80 * sortedResults.length, screenWidth + 1);

  const chartData = {
    labels: sortedResults.map(result => format(parseISO(result.created_at), 'MM/dd')),
    datasets: [
      {
        data: sortedResults.map(result => result.metrics.lowestContrastLevel || 0),
        color: (opacity = 1) => theme.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        bounces
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.select({
            web: {
              cursor: 'grab',
            },
          }),
        ]}
      >
        <View style={{ minWidth: chartWidth }}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 1,
              color: (opacity = 1) => theme.primary,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.primary,
                fill: theme.primary
              },
              formatYLabel: (y) => `${y}%`,
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    minHeight: 240,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});