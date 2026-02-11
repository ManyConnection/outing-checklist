import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { useStatistics } from '@/hooks/useStatistics';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function StatsScreen() {
  const stats = useStatistics();
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const dangerColor = useThemeColor({}, 'danger');
  const successColor = useThemeColor({}, 'success');
  const primaryColor = useThemeColor({}, 'primary');

  const perfectRate =
    stats.totalChecks > 0
      ? Math.round((stats.perfectChecks / stats.totalChecks) * 100)
      : 0;

  if (stats.totalChecks === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>統計</ThemedText>
          </View>
          <EmptyState
            emoji="📊"
            title="まだデータがありません"
            description="チェックリストを使うと、ここに統計が表示されます"
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>統計</ThemedText>
          </View>

          {/* サマリーカード */}
          <View style={styles.statsRow}>
            <StatCard
              emoji="✅"
              title="チェック回数"
              value={stats.totalChecks}
              color={primaryColor}
            />
            <StatCard
              emoji="🎯"
              title="完璧達成"
              value={`${perfectRate}%`}
              subtitle={`${stats.perfectChecks}回`}
              color={successColor}
            />
          </View>

          {/* 週間グラフ */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={styles.cardTitle}>📅 今週のチェック</ThemedText>
            <View style={styles.weeklyChart}>
              {stats.weeklyData.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(day.checks * 20, day.checks > 0 ? 10 : 0)}%`,
                          backgroundColor: primaryColor,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.dayLabel, { color: textSecondary }]}>
                    {day.date}
                  </ThemedText>
                  <ThemedText style={styles.dayValue}>{day.checks}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* よく忘れるアイテム */}
          {stats.forgottenItemsRanking.length > 0 && (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.cardTitle}>⚠️ よく忘れるアイテム</ThemedText>
              {stats.forgottenItemsRanking.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.rankingItem}>
                  <View style={styles.rankBadge}>
                    <ThemedText style={styles.rankText}>{index + 1}</ThemedText>
                  </View>
                  <ThemedText style={styles.rankingName}>{item.itemName}</ThemedText>
                  <ThemedText style={[styles.rankingCount, { color: dangerColor }]}>
                    {item.count}回
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* よく使うリスト */}
          {stats.checklistUsageRanking.length > 0 && (
            <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={styles.cardTitle}>📋 よく使うリスト</ThemedText>
              {stats.checklistUsageRanking.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.rankingItem}>
                  <View style={[styles.rankBadge, { backgroundColor: primaryColor + '20' }]}>
                    <ThemedText style={[styles.rankText, { color: primaryColor }]}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.rankingName}>{item.checklistName}</ThemedText>
                  <ThemedText style={[styles.rankingCount, { color: primaryColor }]}>
                    {item.count}回
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
  },
  dayValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankingName: {
    flex: 1,
    fontSize: 14,
  },
  rankingCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
