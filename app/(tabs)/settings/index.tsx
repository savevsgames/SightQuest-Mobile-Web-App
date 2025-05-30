import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, colors } from '@/contexts/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
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
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Account
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: theme.surface }]}
          >
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.settingLeft}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      {
                        backgroundColor: isDark ? theme.background : '#F0F9FF',
                      },
                    ]}
                  >
                    <Feather name="user" size={20} color={theme.primary} />
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {user?.displayName || 'Set up profile'}
                  </Text>
                  <Text
                    style={[styles.userEmail, { color: theme.textSecondary }]}
                  >
                    {user?.email}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/settings/subscription')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="credit-card"
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: theme.text }]}>
                    Manage Subscription
                  </Text>
                  <Text
                    style={[
                      styles.subscriptionStatus,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {user?.isPro
                      ? `Pro • Expires ${formatDate(user.subscriptionEndsAt)}`
                      : 'Free Plan'}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Preferences
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: theme.surface }]}
          >
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="moon" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingText, { color: theme.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E2E8F0', true: theme.primary }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="bell" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingText, { color: theme.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#E2E8F0', true: theme.primary }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Calibration
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: theme.surface }]}
          >
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/settings/calibration')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="grid-outline"
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: theme.text }]}>
                    Screen Calibration
                  </Text>
                  <Text
                    style={[
                      styles.calibrationStatus,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {user?.calibrated_ppi
                      ? `Calibrated: ${Math.round(user.calibrated_ppi)} PPI`
                      : 'Not calibrated'}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            About
          </Text>
          <View
            style={[styles.settingCard, { backgroundColor: theme.surface }]}
          >
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/about')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="info" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.settingText, { color: theme.text }]}>
                  About SightQuest
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Feather name="log-out" size={20} color={theme.error} />
                </View>
                <Text style={[styles.settingText, { color: theme.error }]}>
                  {isLoading ? 'Logging out...' : 'Logout'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          SightQuest v1.0.0
        </Text>
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
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  subscriptionStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  calibrationStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 2,
  },
});
