const tintColorLight = '#4ECDC4';
const tintColorDark = '#4ECDC4';

export const Colors = {
  light: {
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    background: '#F8F9FA',
    card: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#BDC3C7',
    tabIconSelected: tintColorLight,
    border: '#E8E8E8',
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    card: '#1E2022',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#2D3436',
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    primary: '#4ECDC4',
    secondary: '#FF6B6B',
  },
};

// シーン別カラー
export const SceneColors = {
  commute: '#4ECDC4',   // 通勤 - ティール
  travel: '#FF6B6B',    // 旅行 - コーラル
  gym: '#45B7D1',       // ジム - スカイブルー
  date: '#F8B500',      // デート - ゴールド
  business: '#2C3E50',  // ビジネス - ネイビー
  outdoor: '#2ECC71',   // アウトドア - グリーン
  custom: '#9B59B6',    // カスタム - パープル
};
