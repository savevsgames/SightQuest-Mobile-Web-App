import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, colors } from '@/contexts/ThemeContext';

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  const handleTestPress = (route: string) => {
    router.push({
      pathname: '/(tabs)/tests/[id]',
      params: { id: route },
    });
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
        <Text style={[styles.title, { color: theme.text }]}>Vision Tests</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? theme.surface : '#F0F9FF' },
          ]}
        >
          <View style={styles.infoIconContainer}>
            <Feather name="alert-circle" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.infoText, { color: theme.primary }]}>
            These tests are designed for screening purposes only. For accurate
            diagnosis and medical advice, please consult an eye care
            professional.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Available Tests
        </Text>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.testCard, { backgroundColor: theme.surface }]}
        >
          <TouchableOpacity
            style={styles.testCardContent}
            onPress={() => handleTestPress('letter-acuity')}
          >
            <View style={styles.testHeader}>
              <View
                style={[
                  styles.testIconContainer,
                  { backgroundColor: isDark ? theme.background : '#F0F9FF' },
                ]}
              >
                <Feather name="eye" size={24} color={theme.primary} />
              </View>
              <View style={styles.testBadge}>
                <Text style={styles.testBadgeText}>Most Popular</Text>
              </View>
            </View>

            <View style={styles.testInfo}>
              <Text style={[styles.testTitle, { color: theme.text }]}>
                Letter Acuity Test
              </Text>
              <Text
                style={[styles.testDescription, { color: theme.textSecondary }]}
              >
                Measures your ability to see detail at different sizes, similar
                to a standard eye chart. Letters will start large and become
                progressively smaller as you correctly identify them.
              </Text>

              <View
                style={[
                  styles.testDetails,
                  { backgroundColor: isDark ? theme.background : '#F8FAFC' },
                ]}
              >
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    What it Tests
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Visual acuity (sharpness)
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    2-3 minutes
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Requirements
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Well-lit room, 18" viewing distance
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.primary }]}
                onPress={() => handleTestPress('letter-acuity')}
              >
                <Text style={styles.startButtonText}>Start Test</Text>
                <Feather name="chevron-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={[styles.testCard, { backgroundColor: theme.surface }]}
        >
          <View style={styles.testCardContent}>
            <View style={styles.testHeader}>
              <View
                style={[
                  styles.testIconContainer,
                  { backgroundColor: isDark ? theme.background : '#F0F9FF' },
                ]}
              >
                <Feather name="zap" size={24} color={theme.primary} />
              </View>
            </View>

            <View style={styles.testInfo}>
              <Text style={[styles.testTitle, { color: theme.text }]}>
                Contrast Sensitivity
              </Text>
              <Text
                style={[styles.testDescription, { color: theme.textSecondary }]}
              >
                Evaluates your ability to distinguish objects from their
                background under varying contrast levels. Essential for
                activities like night driving or reading in poor lighting
                conditions.
              </Text>

              <View
                style={[
                  styles.testDetails,
                  { backgroundColor: isDark ? theme.background : '#F8FAFC' },
                ]}
              >
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    What it Tests
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Contrast perception
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    3-4 minutes per test
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Requirements
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Well-lit room, screen brightness at 100%
                  </Text>
                </View>
              </View>

              <View style={styles.contrastButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.contrastButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => handleTestPress('contrast-sensitivity-light')}
                >
                  <Feather name="sun" size={20} color="#FFFFFF" />
                  <Text style={styles.contrastButtonText}>
                    Light Background
                  </Text>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.contrastButton,
                    { backgroundColor: isDark ? theme.background : '#1E293B' },
                  ]}
                  onPress={() => handleTestPress('contrast-sensitivity-dark')}
                >
                  <Feather name="moon" size={20} color="#FFFFFF" />
                  <Text
                    style={[styles.contrastButtonText, { color: '#FFFFFF' }]}
                  >
                    Dark Background
                  </Text>
                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={[styles.testCard, { backgroundColor: theme.surface }]}
        >
          <TouchableOpacity
            style={styles.testCardContent}
            onPress={() => handleTestPress('color-blindness')}
          >
            <View style={styles.testHeader}>
              <View
                style={[
                  styles.testIconContainer,
                  { backgroundColor: isDark ? theme.background : '#F0F9FF' },
                ]}
              >
                <Feather name="droplet" size={24} color={theme.primary} />
              </View>
            </View>

            <View style={styles.testInfo}>
              <Text style={[styles.testTitle, { color: theme.text }]}>
                Color Vision Test
              </Text>
              <Text
                style={[styles.testDescription, { color: theme.textSecondary }]}
              >
                Screens for common types of color vision deficiency using
                Ishihara-style plates. Helps identify potential red-green and
                blue-yellow color blindness.
              </Text>

              <View
                style={[
                  styles.testDetails,
                  { backgroundColor: isDark ? theme.background : '#F8FAFC' },
                ]}
              >
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    What it Tests
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Color vision deficiency
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    2-3 minutes
                  </Text>
                </View>
                <View style={styles.testDetailItem}>
                  <Text style={[styles.detailLabel, { color: theme.primary }]}>
                    Requirements
                  </Text>
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    Well-lit room, calibrated display
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.primary }]}
                onPress={() => handleTestPress('color-blindness')}
              >
                <Text style={styles.startButtonText}>Start Test</Text>
                <Feather name="chevron-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.spacer} />
      </ScrollView>
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
    shadowColor: '#000',
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  testCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  testCardContent: {
    padding: 16,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  testIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBadge: {
    backgroundColor: '#22C55E',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  testBadgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  testDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  testDetails: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  testDetailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 2,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  contrastButtonsContainer: {
    gap: 8,
  },
  contrastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contrastButtonText: {
    flex: 1,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  spacer: {
    height: 24,
  },
});
