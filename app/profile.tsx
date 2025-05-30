import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, colors } from '@/contexts/ThemeContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { supabase } from '../supabase/client';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async () => {
    if (Platform.OS !== 'web') {
      // Handle native platforms if needed
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user profile with new avatar URL
      await updateProfile({
        avatarUrl: publicUrl,
      });
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await updateProfile({
        displayName: displayName.trim(),
      });

      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
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
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: isDark ? theme.surface : '#F0F9FF' },
                ]}
              >
                <Feather name="user" size={40} color={theme.primary} />
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.changeAvatarButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handlePhotoSelect}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="camera" size={20} color="#FFFFFF" />
                  <Text style={styles.changeAvatarText}>Change Photo</Text>
                </>
              )}
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            )}
          </View>

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

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.primary }]}>
                Display Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.primary }]}>
                Email
              </Text>
              <Text
                style={[
                  styles.emailText,
                  {
                    backgroundColor: isDark ? theme.background : '#F1F5F9',
                    color: theme.textSecondary,
                  },
                ]}
              >
                {user?.email}
              </Text>
              <Text style={[styles.emailNote, { color: theme.textSecondary }]}>
                Email cannot be changed. Contact support if you need to update
                your email address.
              </Text>
            </View>

            <View style={styles.subscriptionContainer}>
              <Text
                style={[styles.subscriptionTitle, { color: theme.primary }]}
              >
                Subscription Status
              </Text>
              <View
                style={[
                  styles.subscriptionCard,
                  {
                    backgroundColor: theme.surface,
                    shadowColor: theme.text,
                  },
                ]}
              >
                <View style={styles.subscriptionHeader}>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {user?.isPro ? 'Pro Plan' : 'Free Plan'}
                  </Text>
                  {user?.isPro && (
                    <View
                      style={[
                        styles.proBadge,
                        {
                          backgroundColor: isDark
                            ? theme.background
                            : '#F0F9FF',
                        },
                      ]}
                    >
                      <Text style={[styles.proText, { color: theme.primary }]}>
                        PRO
                      </Text>
                    </View>
                  )}
                </View>
                {user?.isPro && user?.subscriptionEndsAt && (
                  <Text
                    style={[
                      styles.subscriptionDate,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Expires:{' '}
                    {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                  </Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.managePlanButton,
                    {
                      backgroundColor: isDark ? theme.background : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[styles.managePlanText, { color: theme.primary }]}
                  >
                    {user?.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.primary },
              (isLoading || isUploading) && {
                backgroundColor: isDark ? '#38BDF8' : '#93C5FD',
              },
            ]}
            onPress={handleSave}
            disabled={isLoading || isUploading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    opacity: 1,
  },
  changeAvatarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  emailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
  },
  emailNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 8,
  },
  subscriptionContainer: {
    marginTop: 8,
  },
  subscriptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginRight: 12,
  },
  proBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  proText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  subscriptionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  managePlanButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  managePlanText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
