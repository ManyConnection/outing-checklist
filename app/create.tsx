import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useChecklists } from '@/store/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Checklist, ChecklistItem } from '@/types';
import { SceneColors } from '@/constants/Colors';

const EMOJI_OPTIONS = ['🎒', '📦', '🏃', '🎉', '💼', '🛍️', '🎨', '🎵', '📚', '🍽️', '✈️', '🏥'];
const COLOR_OPTIONS = Object.values(SceneColors);

export default function CreateScreen() {
  const { addChecklist } = useChecklists();
  
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎒');
  const [selectedColor, setSelectedColor] = useState(SceneColors.custom);
  const [items, setItems] = useState<{ id: string; name: string; emoji: string }[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemEmoji, setNewItemEmoji] = useState('📦');

  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const inputBg = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const ITEM_EMOJI_OPTIONS = ['📱', '👛', '🔑', '💳', '🎧', '💊', '👕', '📷', '🧴', '📦', '📝', '🪥'];

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems([...items, { id: uuidv4(), name: newItemName.trim(), emoji: newItemEmoji }]);
      setNewItemName('');
      setNewItemEmoji('📦');
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    const newChecklist: Checklist = {
      id: uuidv4(),
      name: name.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: items.map((item, index): ChecklistItem => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        isChecked: false,
        order: index,
        forgotCount: 0,
        checkedCount: 0,
      })),
    };

    addChecklist(newChecklist);
    router.back();
  };

  const isValid = name.trim().length > 0;

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
              <Ionicons name="close" size={24} color={textSecondary} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <ThemedText style={styles.title}>新規リスト作成</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={handleCreate}
              disabled={!isValid}
            >
              <ThemedText
                style={[
                  styles.saveButtonText,
                  { color: isValid ? primaryColor : textSecondary },
                ]}
              >
                作成
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* リスト名入力 */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              リスト名
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <TextInput
                style={[styles.nameInput, { color: textColor }]}
                placeholder="例：買い物、デート、出張"
                placeholderTextColor={textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* アイコン選択 */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              アイコン
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionRow}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === emoji && {
                          backgroundColor: selectedColor + '20',
                          borderColor: selectedColor,
                        },
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <ThemedText style={styles.emojiOptionText}>{emoji}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* カラー選択 */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              テーマカラー
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionRow}>
                  {COLOR_OPTIONS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* プレビュー */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              プレビュー
            </ThemedText>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: cardBg, borderColor: selectedColor, borderWidth: 2 },
              ]}
            >
              <View style={[styles.previewEmoji, { backgroundColor: selectedColor + '20' }]}>
                <ThemedText style={styles.previewEmojiText}>{selectedEmoji}</ThemedText>
              </View>
              <ThemedText style={styles.previewName}>
                {name || 'リスト名'}
              </ThemedText>
            </View>

            {/* アイテム追加 */}
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              アイテム（任意）
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              {items.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && (
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                  )}
                  <View style={styles.itemRow}>
                    <ThemedText style={styles.itemEmoji}>{item.emoji}</ThemedText>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Ionicons name="close-circle" size={20} color={textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.addItemSection}>
                {items.length > 0 && (
                  <View style={[styles.divider, { backgroundColor: borderColor }]} />
                )}
                <View style={styles.emojiPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ITEM_EMOJI_OPTIONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.smallEmojiOption,
                          newItemEmoji === emoji && {
                            backgroundColor: primaryColor + '20',
                            borderColor: primaryColor,
                          },
                        ]}
                        onPress={() => setNewItemEmoji(emoji)}
                      >
                        <ThemedText style={styles.smallEmojiText}>{emoji}</ThemedText>
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
                    onSubmitEditing={handleAddItem}
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      { backgroundColor: newItemName.trim() ? primaryColor : borderColor },
                    ]}
                    onPress={handleAddItem}
                    disabled={!newItemName.trim()}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <ThemedText style={[styles.hint, { color: textSecondary }]}>
              💡 アイテムは後から編集画面で追加・変更できます
            </ThemedText>

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
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  nameInput: {
    padding: 16,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    padding: 12,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewEmojiText: {
    fontSize: 24,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  itemEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  addItemSection: {
    paddingBottom: 12,
  },
  emojiPicker: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  smallEmojiOption: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  smallEmojiText: {
    fontSize: 16,
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
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
