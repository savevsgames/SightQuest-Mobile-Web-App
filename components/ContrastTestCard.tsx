import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { useTheme, colors } from '@/contexts/ThemeContext';
import { useMobileKeyboard } from '@/hooks/useMobileKeyboard';

type ContrastTestCardProps = {
  letter: string;
  contrastLevel: number;
  isDarkTest: boolean;
  onAnswer: (answer: string) => void;
  inputRef: React.RefObject<TextInput>;
  letterCount: number;
  totalLetters: number;
};

const getLetterColor = (contrastLevel: number, isDarkTest: boolean): string => {
  const bg = isDarkTest ? 20 : 240; // background luminance estimate (0-255)
  const contrast = contrastLevel / 100; // convert to 0-1
  const fgLuminance = isDarkTest
    ? Math.round(bg + (255 - bg) * contrast) // light text on dark bg
    : Math.round(bg - bg * contrast);       // dark text on light bg

  return `rgb(${fgLuminance}, ${fgLuminance}, ${fgLuminance})`;
};

export default function ContrastTestCard({
  letter,
  contrastLevel,
  isDarkTest,
  onAnswer,
  inputRef,
  letterCount,
  totalLetters,
}: ContrastTestCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  useMobileKeyboard({
    inputRef,
    type: 'text',
    enterKeyHint: 'go',
    autoFocus: true
  });

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkTest ? '#000000' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.letter,
        {
          color: getLetterColor(contrastLevel, isDarkTest),
          fontSize: 48,
          fontFamily: Platform.select({ web: 'monospace', default: 'Inter-Bold' })
        }
      ]}>
        {letter}
      </Text>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { 
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            color: isDark ? '#F8FAFC' : '#1E293B'
          }
        ]}
        maxLength={1}
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={onAnswer}
        placeholder="Type the letter you see"
        placeholderTextColor={isDark ? '#94A3B8' : '#64748B'}
      />
      <View style={styles.progressContainer}>
        <Text style={[
          styles.progress,
          { color: isDark ? '#94A3B8' : '#64748B' }
        ]}>
          Letter {letterCount} of {totalLetters}
        </Text>
        <Text style={[
          styles.contrastLevel,
          { color: isDark ? '#94A3B8' : '#64748B' }
        ]}>
          Contrast Level: {contrastLevel}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  letter: {
    marginBottom: 48,
  },
  input: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progress: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  contrastLevel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
});