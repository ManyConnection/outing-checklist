import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useChecklist, useChecklists } from '@/store/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChecklistItem } from '@/types';

const EMOJI_OPTIONS = ['📱', '👛', '🔑', '💳', '🎧', '💊', '👕', '📷', '🧴', '🎒', '📝', '🪥'];

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { checklist, addItem, updateItem, deleteItem, reorderItems } = useChecklist(id || '');
  const { updateChecklist, deleteChecklist } = useChecklists();

  const [newItemName, setNewItemName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const dangerColor = useThemeColor({}, 'danger');
  const primaryColor = useThemeColor({}, 'primary');
  const inputBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  if (!checklist) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>チェックリストが見つかりません</ThemedText>
      </ThemedView>
    );
  }

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: ChecklistItem = {
        id: uuidv4(),
        name: newItemName.trim(),
        emoji: selectedEmoji,
        isChecked: false,
        order: checklist.items.length,
        forgotCount: 0,
        checkedCount: 0,
      };
      addItem(newItem);
      setNewItemName('');
      setSelectedEmoji('📦');
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'アイテムを削除',
      `「${itemName}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteItem(itemId),
        },
      ]
    );
  };

  const handleDeleteChecklist = () => {
    Alert.alert(
      'チェックリストを削除',
      `「${checklist.name}」を削除しますか？この操作は取り消せません。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteChecklist(checklist.id);
            router.back();
            router.back();
          },
        },
      ]
    );
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex((item) => item.id === itemId);

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedItems.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newItems = [...sortedItems];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    reorderItems(reorderedItems);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <ThemedText style={styles.title}>リスト編集</ThemedText>
            </View>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* リスト情報 */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.listInfo}>
                <View style={[styles.emojiContainer, { backgroundColor: checklist.color + '20' }]}>
                  <ThemedText style={styles.emoji}>{checklist.emoji}</ThemedText>
                </View>
                <View style={styles.listInfoText}>
                  <ThemedText style={styles.listName}>{checklist.name}</ThemedText>
                  <ThemedText style={[styles.listItemCount, { color: textSecondary }]}>
                    {checklist.items.length} アイテム
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* アイテムリスト */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              アイテム
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              {checklist.items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <View key={item.id}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: borderColor }]} />
                    )}
                    <View style={styles.itemRow}>
                      <View style={styles.itemContent}>
                        <ThemedText style={styles.itemEmoji}>{item.emoji || '📦'}</ThemedText>
                        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                      </View>
                      <View style={styles.itemActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveItem(item.id, 'up')}
                          disabled={index === 0}
                        >
                          <Ionicons
                            name="chevron-up"
                            size={18}
                            color={index === 0 ? borderColor : textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveItem(item.id, 'down')}
                          disabled={index === checklist.items.length - 1}
                        >
                          <Ionicons
                            name="chevron-down"
                            size={18}
                            color={index === checklist.items.length - 1 ? borderColor : textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteItem(item.id, item.name)}
                        >
                          <Ionicons name="trash" size={16} color={dangerColor} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

              {/* 新規アイテム追加 */}
              {isAddingItem ? (
                <View style={styles.addItemForm}>
                  <View style={[styles.divider, { backgroundColor: borderColor }]} />
                  <View style={styles.emojiPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {EMOJI_OPTIONS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={[
                            styles.emojiOption,
                            selectedEmoji === emoji && {
                              backgroundColor: primaryColor + '20',
                              borderColor: primaryColor,
                            },
                          ]}
                          onPress={() => setSelectedEmoji(emoji)}
                        >
                          <ThemedText style={styles.emojiOptionText}>{emoji}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[
                        styles.textInput,
                        { backgroundColor: inputBg, borderColor, color: textColor },
                      ]}
                      placeholder="アイテム名を入力"
                      placeholderTextColor={textSecondary}
                      value={newItemName}
                      onChangeText={setNewItemName}
                      autoFocus
                      onSubmitEditing={handleAddItem}
                    />
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: primaryColor }]}
                      onPress={handleAddItem}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsAddingItem(false)}
                    >
                      <Ionicons name="close" size={20} color={textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => setIsAddingItem(true)}
                >
                  <Ionicons name="add-circle" size={20} color={primaryColor} />
                  <ThemedText style={[styles.addItemButtonText, { color: primaryColor }]}>
                    アイテムを追加
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {/* 削除ボタン */}
            {checklist.isCustom && (
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: dangerColor }]}
                onPress={handleDeleteChecklist}
              >
                <Ionicons name="trash" size={20} color={dangerColor} />
                <ThemedText style={[styles.deleteButtonText, { color: dangerColor }]}>
                  このリストを削除
                </ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  listInfoText: {
    marginLeft: 12,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
  },
  listItemCount: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  divider: {
    height: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  addItemButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  addItemForm: {
    paddingBottom: 12,
  },
  emojiPicker: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiOptionText: {
    fontSize: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
