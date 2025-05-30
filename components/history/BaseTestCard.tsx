import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, colors } from '@/contexts/ThemeContext';

type BaseTestCardProps = {
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export default function BaseTestCard({
  title,
  description,
  isExpanded,
  onToggle,
  children,
}: BaseTestCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <View style={styles.sectionHeaderLeft}>
          <Feather name="bar-chart-2" size={24} color={theme.primary} />
          <View style={styles.sectionHeaderText}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {title}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              {description}
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <Feather name="chevron-up" size={20} color={theme.textSecondary} />
        ) : (
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        )}
      </TouchableOpacity>

      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    marginLeft: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
  sectionContent: {
    padding: 16,
    borderTopWidth: 1,
  },
});
