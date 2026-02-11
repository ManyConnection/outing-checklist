// アイテム
export interface ChecklistItem {
  id: string;
  name: string;
  emoji?: string;
  isChecked: boolean;
  order: number;
  // 統計用
  forgotCount: number;
  checkedCount: number;
}

// シーン別チェックリスト
export interface Checklist {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: ChecklistItem[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  // リマインダー設定
  reminder?: ReminderSettings;
}

// リマインダー設定
export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:mm" format
  days: number[]; // 0-6 (日曜日-土曜日)
  notificationId?: string;
}

// チェック履歴
export interface CheckHistory {
  id: string;
  checklistId: string;
  checklistName: string;
  date: string;
  totalItems: number;
  checkedItems: number;
  forgottenItems: string[]; // アイテム名の配列
}

// 統計データ
export interface Statistics {
  totalChecks: number;
  perfectChecks: number; // 忘れ物なしの回数
  forgottenItemsRanking: { itemName: string; count: number }[];
  checklistUsageRanking: { checklistId: string; checklistName: string; count: number }[];
  weeklyData: { date: string; checks: number; perfectRate: number }[];
}

// アプリ設定
export interface AppSettings {
  defaultReminderTime: string;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  theme: 'light' | 'dark' | 'system';
}

// ストア全体の状態
export interface AppState {
  checklists: Checklist[];
  history: CheckHistory[];
  settings: AppSettings;
}
