import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Checklist } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface ChecklistCardProps {
  checklist: Checklist;
  onPress: () => void;
  onQuickCheck?: () => void;
}

export function ChecklistCard({ checklist, onPress, onQuickCheck }: ChecklistCardProps) {
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const checkedCount = checklist.items.filter((item) => item.isChecked).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.emojiContainer, { backgroundColor: checklist.color + '20' }]}>
          <ThemedText style={styles.emoji}>{checklist.emoji}</ThemedText>
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{checklist.name}</ThemedText>
          <ThemedText style={[styles.itemCount, { color: textSecondary }]}>
            {checkedCount}/{totalCount} アイテム
          </ThemedText>
        </View>
        {onQuickCheck && (
          <TouchableOpacity
            style={[styles.quickCheckButton, { backgroundColor: checklist.color }]}
            onPress={onQuickCheck}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress * 100}%`,
              backgroundColor: checklist.color,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 14,
    marginTop: 2,
  },
  quickCheckButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
