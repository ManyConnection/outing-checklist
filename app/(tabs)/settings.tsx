import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSettings, useChecklists, useHistory, useApp } from '@/store/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotifications } from '@/hooks/useNotifications';
import { createDefaultChecklists } from '@/constants/DefaultChecklists';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { checklists } = useChecklists();
  const { history } = useHistory();
  const { dispatch } = useApp();
  const { cancelAllReminders } = useNotifications();
  
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const dangerColor = useThemeColor({}, 'danger');
  const primaryColor = useThemeColor({}, 'primary');

  const handleResetChecklists = () => {
    Alert.alert(
      'チェックリストをリセット',
      'すべてのチェックリストを初期状態に戻しますか？カスタムリストは削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            const defaultChecklists = createDefaultChecklists();
            dispatch({
              type: 'LOAD_DATA',
              payload: {
                checklists: defaultChecklists,
                history: [],
                settings,
              },
            });
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      '履歴を削除',
      'すべてのチェック履歴と統計データを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'LOAD_DATA',
              payload: {
                checklists,
                history: [],
                settings,
              },
            });
          },
        },
      ]
    );
  };

  const handleDisableNotifications = async () => {
    await cancelAllReminders();
    updateSettings({ notificationsEnabled: false });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>設定</ThemedText>
          </View>

          {/* 通知設定 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              通知
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={20} color={primaryColor} />
                  <ThemedText style={styles.settingLabel}>通知を有効化</ThemedText>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={(value) => {
                    if (!value) {
                      handleDisableNotifications();
                    } else {
                      updateSettings({ notificationsEnabled: value });
                    }
                  }}
                  trackColor={{ false: '#E8E8E8', true: primaryColor + '60' }}
                  thumbColor={settings.notificationsEnabled ? primaryColor : '#f4f3f4'}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="phone-portrait" size={20} color={primaryColor} />
                  <ThemedText style={styles.settingLabel}>触覚フィードバック</ThemedText>
                </View>
                <Switch
                  value={settings.hapticFeedback}
                  onValueChange={(value) => updateSettings({ hapticFeedback: value })}
                  trackColor={{ false: '#E8E8E8', true: primaryColor + '60' }}
                  thumbColor={settings.hapticFeedback ? primaryColor : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* データ管理 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              データ管理
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textSecondary }]}>
                  チェックリスト数
                </ThemedText>
                <ThemedText style={styles.infoValue}>{checklists.length}</ThemedText>
              </View>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textSecondary }]}>
                  チェック履歴
                </ThemedText>
                <ThemedText style={styles.infoValue}>{history.length}件</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleResetChecklists}
            >
              <Ionicons name="refresh" size={20} color={dangerColor} />
              <ThemedText style={[styles.actionButtonText, { color: dangerColor }]}>
                チェックリストをリセット
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleClearHistory}
            >
              <Ionicons name="trash" size={20} color={dangerColor} />
              <ThemedText style={[styles.actionButtonText, { color: dangerColor }]}>
                履歴を削除
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* アプリ情報 */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textSecondary }]}>
              アプリ情報
            </ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textSecondary }]}>
                  バージョン
                </ThemedText>
                <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: textSecondary }]}>
              おでかけチェック 🎒
            </ThemedText>
            <ThemedText style={[styles.footerSubtext, { color: textSecondary }]}>
              忘れ物ゼロを目指そう！
            </ThemedText>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
