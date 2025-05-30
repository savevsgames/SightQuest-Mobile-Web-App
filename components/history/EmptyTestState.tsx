import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme, colors } from '@/contexts/ThemeContext';

type EmptyTestStateProps = {
  testType: string;
};

export default function EmptyTestState({ testType }: EmptyTestStateProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No test results yet
      </Text>
      <TouchableOpacity 
        style={[styles.takeTestButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push(`/tests/${testType}`)}
      >
        <Text style={styles.takeTestText}>Take a Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  takeTestButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  takeTestText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});