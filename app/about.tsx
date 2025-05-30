import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, colors } from '@/contexts/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

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
        <Text style={[styles.title, { color: theme.text }]}>
          About SightQuest
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo-blue-light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: theme.text }]}>
              SightQuest
            </Text>
            <Text style={[styles.version, { color: theme.textSecondary }]}>
              Version 1.0.0
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Our Mission
            </Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              SightQuest is dedicated to helping you monitor and understand your
              visual health through simple, interactive tests. Our goal is to
              make vision testing accessible and convenient, while encouraging
              regular professional eye care checkups.
            </Text>
          </View>

          <View
            style={[
              styles.section,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              },
            ]}
          >
            <Text style={[styles.disclaimerTitle, { color: theme.error }]}>
              Medical Disclaimer
            </Text>
            <Text
              style={[
                styles.disclaimerText,
                { color: isDark ? theme.text : '#991B1B' },
              ]}
            >
              SightQuest is not a substitute for professional medical advice,
              diagnosis, or treatment. The tests provided are for screening
              purposes only and should not be used to make medical decisions.
            </Text>
            <Text
              style={[
                styles.disclaimerText,
                { color: isDark ? theme.text : '#991B1B', marginTop: 12 },
              ]}
            >
              If you are experiencing vision problems or have concerns about
              your eye health, please consult an eye care professional
              immediately. Only a qualified healthcare provider can properly
              evaluate your vision and eye health needs.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Features
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: isDark ? theme.background : '#F0F9FF' },
                  ]}
                >
                  <Image
                    source={require('@/assets/images/logo-blue-light.png')}
                    style={styles.featureIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Vision Tests
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Interactive tests to assess different aspects of your vision
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: isDark ? theme.background : '#F0F9FF' },
                  ]}
                >
                  <Feather name="heart" size={24} color={theme.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Progress Tracking
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Monitor your vision health over time with detailed analytics
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Contact Us
            </Text>
            <View style={styles.contactList}>
              <TouchableOpacity style={styles.contactItem}>
                <Feather name="mail" size={20} color={theme.primary} />
                <Text style={[styles.contactText, { color: theme.text }]}>
                  support@sightquest.com
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem}>
                <Feather name="globe" size={20} color={theme.primary} />
                <Text style={[styles.contactText, { color: theme.text }]}>
                  www.sightquest.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.copyright, { color: theme.textSecondary }]}>
            © 2024 SightQuest. All rights reserved.
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  sectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  disclaimerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 12,
  },
  disclaimerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 22,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  copyright: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
