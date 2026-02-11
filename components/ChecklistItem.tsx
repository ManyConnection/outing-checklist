import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChecklistItem as ItemType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ChecklistItemProps {
  item: ItemType;
  onToggle: () => void;
  color: string;
  showStats?: boolean;
}

export function ChecklistItemComponent({ item, onToggle, color, showStats }: ChecklistItemProps) {
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const dangerColor = useThemeColor({}, 'danger');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: cardBg,
          borderColor: item.isChecked ? color : borderColor,
          borderWidth: item.isChecked ? 2 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: item.isChecked ? color : borderColor,
            backgroundColor: item.isChecked ? color : 'transparent',
          },
        ]}
      >
        {item.isChecked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          {item.emoji && <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>}
          <ThemedText
            style={[
              styles.name,
              item.isChecked && styles.nameChecked,
            ]}
          >
            {item.name}
          </ThemedText>
        </View>
        {showStats && item.forgotCount > 0 && (
          <View style={styles.statsRow}>
            <Ionicons name="alert-circle" size={12} color={dangerColor} />
            <ThemedText style={[styles.statsText, { color: dangerColor }]}>
              {item.forgotCount}回忘れた
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  nameChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statsText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
