import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ChecklistCard } from '@/components/ChecklistCard';
import { EmptyState } from '@/components/EmptyState';
import { useChecklists, useApp } from '@/store/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const { checklists } = useChecklists();
  const { isLoading } = useApp();
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'card');

  const handleChecklistPress = (id: string) => {
    router.push(`/check/${id}`);
  };

  const handleCreatePress = () => {
    router.push('/create');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>読み込み中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>おでかけ前に 🎒</ThemedText>
            <ThemedText style={styles.title}>チェックリスト</ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={handleCreatePress}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {checklists.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="チェックリストがありません"
            description="右上の＋ボタンから新しいチェックリストを作成しましょう"
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.sectionTitle}>シーン別リスト</ThemedText>
            {checklists
              .filter((c) => !c.isCustom)
              .map((checklist) => (
                <ChecklistCard
                  key={checklist.id}
                  checklist={checklist}
                  onPress={() => handleChecklistPress(checklist.id)}
                  onQuickCheck={() => handleChecklistPress(checklist.id)}
                />
              ))}

            {checklists.some((c) => c.isCustom) && (
              <>
                <ThemedText style={[styles.sectionTitle, styles.sectionTitleMargin]}>
                  カスタムリスト
                </ThemedText>
                {checklists
                  .filter((c) => c.isCustom)
                  .map((checklist) => (
                    <ChecklistCard
                      key={checklist.id}
                      checklist={checklist}
                      onPress={() => handleChecklistPress(checklist.id)}
                      onQuickCheck={() => handleChecklistPress(checklist.id)}
                    />
                  ))}
              </>
            )}
            <View style={styles.bottomPadding} />
          </ScrollView>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleMargin: {
    marginTop: 24,
  },
  bottomPadding: {
    height: 20,
  },
});
