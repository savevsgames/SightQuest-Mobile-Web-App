import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, colors } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Image 
          source={require('@/assets/images/logo-blue-light.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Welcome to SightQuest</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: theme.primary }]}>Track Your Vision Journey</Text>
        <Text style={[styles.description, { color: theme.text }]}>
          Monitor your eye health progress over time with our comprehensive vision tests. Each test result is saved, allowing you to track changes and understand your visual health trends.
        </Text>
        <View style={[styles.featureBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.featureTitle, { color: theme.primary }]}>Key Features:</Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: theme.text }]}>• Regular vision assessments</Text>
            <Text style={[styles.featureItem, { color: theme.text }]}>• Detailed progress tracking</Text>
            <Text style={[styles.featureItem, { color: theme.text }]}>• Historical test results</Text>
            <Text style={[styles.featureItem, { color: theme.text }]}>• Visual health insights</Text>
          </View>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
});