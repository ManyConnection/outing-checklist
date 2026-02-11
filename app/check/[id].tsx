import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ChecklistItemComponent } from '@/components/ChecklistItem';
import { useChecklist, useHistory, useApp } from '@/store/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CheckHistory } from '@/types';

export default function CheckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { checklist, toggleItem, resetChecklist } = useChecklist(id || '');
  const { saveHistory } = useHistory();
  const { dispatch } = useApp();
  
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const primaryColor = useThemeColor({}, 'primary');

  if (!checklist) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>チェックリストが見つかりません</ThemedText>
      </ThemedView>
    );
  }

  const checkedCount = checklist.items.filter((item) => item.isChecked).length;
  const totalCount = checklist.items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;
  const isComplete = checkedCount === totalCount && totalCount > 0;

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // 忘れ物を記録
    const forgottenItems = checklist.items
      .filter((item) => !item.isChecked)
      .map((item) => item.name);

    // 履歴を保存
    const history: CheckHistory = {
      id: uuidv4(),
      checklistId: checklist.id,
      checklistName: checklist.name,
      date: new Date().toISOString(),
      totalItems: totalCount,
      checkedItems: checkedCount,
      forgottenItems,
    };
    saveHistory(history);

    // 忘れ物アイテムのカウントを更新
    forgottenItems.forEach((itemName) => {
      const item = checklist.items.find((i) => i.name === itemName);
      if (item) {
        dispatch({
          type: 'RECORD_FORGOTTEN_ITEM',
          payload: { checklistId: checklist.id, itemId: item.id },
        });
      }
    });

    if (isComplete) {
      Alert.alert(
        '完璧！ 🎉',
        '忘れ物なしでおでかけできます！',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert(
        '確認完了',
        `${forgottenItems.length}個のアイテムが未チェックです。このまま出発しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '出発する',
            onPress: () => {
              resetChecklist();
              router.back();
            },
          },
        ]
      );
    }
  };

  const handleReset = () => {
    Alert.alert(
      'リセット',
      'すべてのチェックを外しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            resetChecklist();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/edit/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={primaryColor} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <ThemedText style={styles.emoji}>{checklist.emoji}</ThemedText>
            <ThemedText style={styles.title}>{checklist.name}</ThemedText>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color={primaryColor} />
          </TouchableOpacity>
        </View>

        {/* 進捗バー */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <ThemedText style={[styles.progressText, { color: textSecondary }]}>
              {checkedCount} / {totalCount} 完了
            </ThemedText>
            <ThemedText
              style={[
                styles.progressPercent,
                { color: isComplete ? successColor : primaryColor },
              ]}
            >
              {Math.round(progress * 100)}%
            </ThemedText>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isComplete ? successColor : checklist.color,
                },
              ]}
            />
          </View>
        </View>

        {/* アイテムリスト */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {checklist.items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                color={checklist.color}
                showStats
              />
            ))}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* アクションボタン */}
        <View style={[styles.actionBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor }]}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={20} color={textSecondary} />
            <ThemedText style={[styles.resetButtonText, { color: textSecondary }]}>
              リセット
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: isComplete ? successColor : checklist.color },
            ]}
            onPress={handleComplete}
          >
            <Ionicons name={isComplete ? 'checkmark-done' : 'exit'} size={20} color="white" />
            <ThemedText style={styles.completeButtonText}>
              {isComplete ? '完璧！出発' : 'おでかけ'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
