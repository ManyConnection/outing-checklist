import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StatCardProps {
  emoji: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function StatCard({ emoji, title, value, subtitle, color }: StatCardProps) {
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primaryColor = color || useThemeColor({}, 'primary');

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.emojiContainer, { backgroundColor: primaryColor + '20' }]}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      </View>
      <ThemedText style={[styles.title, { color: textSecondary }]}>{title}</ThemedText>
      <ThemedText style={[styles.value, { color: primaryColor }]}>{value}</ThemedText>
      {subtitle && (
        <ThemedText style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    margin: 4,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});
