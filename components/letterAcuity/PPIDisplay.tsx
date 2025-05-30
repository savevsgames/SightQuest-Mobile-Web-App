import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, colors } from '@/contexts/ThemeContext';

type PPIDisplayProps = {
  ppi: number | undefined;
};

export default function PPIDisplay({ ppi }: PPIDisplayProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? theme.background : '#F0F9FF' },
      ]}
    >
      <Feather name="monitor" size={20} color={theme.primary} />
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Screen Resolution
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {ppi ? `${Math.round(ppi)} PPI` : 'Not calibrated'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  textContainer: {
    marginLeft: 12,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  value: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginTop: 2,
  },
});
