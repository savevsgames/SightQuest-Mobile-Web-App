import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme, colors } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStripe } from '@/hooks/useStripe';
import { STRIPE_PRODUCTS } from '@/stripe-config';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const { user } = useAuth();
  const { createCheckoutSession } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = await createCheckoutSession(
        STRIPE_PRODUCTS.MONTHLY.priceId,
        STRIPE_PRODUCTS.MONTHLY.mode
      );

      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          {user?.isPro && (
            <View
              style={[
                styles.currentPlan,
                {
                  backgroundColor: isDark
                    ? 'rgba(14, 165, 233, 0.1)'
                    : '#F0F9FF',
                },
              ]}
            >
              <View style={styles.currentPlanHeader}>
                <MaterialIcons
                  name="credit-card"
                  size={24}
                  color={theme.primary}
                />
                <View style={styles.currentPlanInfo}>
                  <Text
                    style={[styles.currentPlanTitle, { color: theme.text }]}
                  >
                    Current Plan: Pro
                  </Text>
                  <Text
                    style={[
                      styles.currentPlanExpiry,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Expires: {formatDate(user.subscriptionEndsAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : '#FEE2E2',
                },
              ]}
            >
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Available Plans
          </Text>

          <View
            style={[
              styles.planCard,
              { backgroundColor: theme.surface },
              !user?.isPro && styles.activePlan,
            ]}
          >
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: theme.text }]}>
                Free Plan
              </Text>
              <Text style={[styles.planPrice, { color: theme.text }]}>$0</Text>
            </View>
            {!user?.isPro && (
              <View
                style={[
                  styles.currentLabel,
                  { backgroundColor: theme.success },
                ]}
              >
                <Text style={styles.currentLabelText}>CURRENT PLAN</Text>
              </View>
            )}
            <Text style={[styles.planPeriod, { color: theme.textSecondary }]}>
              Limited Features
            </Text>
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Basic eye tests
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Test history for 1 week
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.planCard,
              styles.proPlan,
              { backgroundColor: theme.surface },
              user?.isPro && styles.activePlan,
            ]}
          >
            <View style={[styles.proLabel, { backgroundColor: theme.primary }]}>
              <Text style={styles.proLabelText}>RECOMMENDED</Text>
            </View>
            {user?.isPro && (
              <View
                style={[
                  styles.currentLabel,
                  { backgroundColor: theme.success },
                ]}
              >
                <Text style={styles.currentLabelText}>CURRENT PLAN</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: theme.text }]}>
                Pro Plan
              </Text>
              <View>
                <Text style={[styles.planPrice, { color: theme.text }]}>
                  $8
                </Text>
                <Text
                  style={[styles.planPeriod, { color: theme.textSecondary }]}
                >
                  /month
                </Text>
              </View>
            </View>
            <Text style={[styles.yearlyPrice, { color: theme.primary }]}>
              or $50/year (save 48%)
            </Text>
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  All eye tests
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Unlimited test history
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Detailed analytics
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={20} color={theme.success} />
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Progress tracking
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              { backgroundColor: theme.primary },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={handleSubscription}
            disabled={isLoading}
          >
            <Text style={styles.subscribeButtonText}>
              {isLoading
                ? 'Processing...'
                : user?.isPro
                ? 'Manage Subscription'
                : 'Upgrade to Pro'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.terms, { color: theme.textSecondary }]}>
            Cancel anytime. You will keep your tests from the time you have paid
            but new tests will expire after 30 days if you cancel. If you
            resume, you will be able to see your old results from when you were
            paid.
          </Text>
        </Animated.View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  currentPlan: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPlanInfo: {
    marginLeft: 12,
  },
  currentPlanTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  currentPlanExpiry: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  activePlan: {
    borderWidth: 2,
    borderColor: colors.light.success,
  },
  currentLabel: {
    position: 'absolute',
    top: -12,
    left: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentLabelText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  proPlan: {
    position: 'relative',
    marginBottom: 32,
  },
  proLabel: {
    position: 'absolute',
    top: -12,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proLabelText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  planPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    textAlign: 'right',
  },
  planPeriod: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  yearlyPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  features: {
    marginTop: 16,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  terms: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
