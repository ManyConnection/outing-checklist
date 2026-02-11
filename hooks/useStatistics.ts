import { useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import { Statistics } from '@/types';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

export function useStatistics(): Statistics {
  const { state } = useApp();
  const { history, checklists } = state;

  return useMemo(() => {
    // Total checks
    const totalChecks = history.length;

    // Perfect checks (no forgotten items)
    const perfectChecks = history.filter((h) => h.forgottenItems.length === 0).length;

    // Forgotten items ranking
    const forgottenItemsMap = new Map<string, number>();
    history.forEach((h) => {
      h.forgottenItems.forEach((itemName) => {
        forgottenItemsMap.set(itemName, (forgottenItemsMap.get(itemName) || 0) + 1);
      });
    });
    const forgottenItemsRanking = Array.from(forgottenItemsMap.entries())
      .map(([itemName, count]) => ({ itemName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Checklist usage ranking
    const checklistUsageMap = new Map<string, { name: string; count: number }>();
    history.forEach((h) => {
      const existing = checklistUsageMap.get(h.checklistId);
      if (existing) {
        existing.count += 1;
      } else {
        checklistUsageMap.set(h.checklistId, { name: h.checklistName, count: 1 });
      }
    });
    const checklistUsageRanking = Array.from(checklistUsageMap.entries())
      .map(([checklistId, { name, count }]) => ({
        checklistId,
        checklistName: name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Weekly data (last 7 days)
    const weeklyData: { date: string; checks: number; perfectRate: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayHistory = history.filter((h) => {
        const historyDate = startOfDay(parseISO(h.date));
        return format(historyDate, 'yyyy-MM-dd') === dateStr;
      });
      const checks = dayHistory.length;
      const perfectRate =
        checks > 0
          ? Math.round(
              (dayHistory.filter((h) => h.forgottenItems.length === 0).length / checks) * 100
            )
          : 0;
      weeklyData.push({
        date: format(date, 'M/d'),
        checks,
        perfectRate,
      });
    }

    return {
      totalChecks,
      perfectChecks,
      forgottenItemsRanking,
      checklistUsageRanking,
      weeklyData,
    };
  }, [history, checklists]);
}
