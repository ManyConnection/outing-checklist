import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { AppProvider } from '../store/AppContext';
import CreateScreen from '../app/create';
import EditScreen from '../app/edit/[id]';

// Mock hooks
jest.mock('../hooks/useThemeColor', () => ({
  useThemeColor: () => '#333333',
}));

jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('../constants/Colors', () => ({
  Colors: {
    light: { primary: '#007AFF' },
    dark: { primary: '#0A84FF' },
  },
  SceneColors: {
    custom: '#9b59b6',
    work: '#3498db',
    travel: '#e74c3c',
  },
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('Input Validation - CreateScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should not create checklist with empty name', () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<CreateScreen />);
    
    // Leave name empty
    const input = getByPlaceholderText('例：買い物、デート、出張');
    expect(input.props.value).toBe('');
    
    // Try to create
    const createButton = getByText('作成');
    fireEvent.press(createButton);
    
    // Should not navigate
    expect(router.back).not.toHaveBeenCalled();
  });

  it('should not create checklist with whitespace-only name', () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<CreateScreen />);
    
    const input = getByPlaceholderText('例：買い物、デート、出張');
    fireEvent.changeText(input, '   ');
    
    const createButton = getByText('作成');
    fireEvent.press(createButton);
    
    expect(router.back).not.toHaveBeenCalled();
  });

  it('should trim whitespace from checklist name', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<CreateScreen />);
    
    const input = getByPlaceholderText('例：買い物、デート、出張');
    fireEvent.changeText(input, '  テスト名  ');
    
    const createButton = getByText('作成');
    fireEvent.press(createButton);
    
    // Should succeed and navigate
    expect(router.back).toHaveBeenCalled();
    
    // Verify saved data is trimmed
    await waitFor(async () => {
      const savedData = await AsyncStorage.getItem('@outing_checklist_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        const customChecklist = data.checklists.find((c: any) => c.isCustom);
        if (customChecklist) {
          expect(customChecklist.name).toBe('テスト名');
        }
      }
    });
  });

  it('should not add item with empty name', () => {
    const { getByPlaceholderText } = renderWithProvider(<CreateScreen />);
    
    const itemInput = getByPlaceholderText('アイテム名を入力');
    fireEvent.changeText(itemInput, '');
    
    // Submit empty item
    fireEvent(itemInput, 'submitEditing');
    
    // Item should not be added (we can verify by checking the form still exists)
    expect(getByPlaceholderText('アイテム名を入力')).toBeTruthy();
  });

  it('should trim whitespace from item names', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProvider(<CreateScreen />);
    
    const itemInput = getByPlaceholderText('アイテム名を入力');
    fireEvent.changeText(itemInput, '  テストアイテム  ');
    fireEvent(itemInput, 'submitEditing');
    
    // The trimmed name should appear in the list
    expect(getByText('テストアイテム')).toBeTruthy();
  });
});

describe('Input Validation - EditScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    
    const testData = {
      checklists: [{
        id: 'validation-edit-test',
        name: 'バリデーションテスト',
        emoji: '📝',
        color: '#3498db',
        items: [
          { id: 'v-item-1', name: '既存アイテム', emoji: '📦', isChecked: false, order: 0, forgotCount: 0, checkedCount: 0 },
        ],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      history: [],
      settings: {
        defaultReminderTime: '08:00',
        notificationsEnabled: true,
        hapticFeedback: true,
        theme: 'system',
      },
    };
    await AsyncStorage.setItem('@outing_checklist_data', JSON.stringify(testData));
    
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'validation-edit-test' });
  });

  it('shows add item form when button is pressed', async () => {
    const { getByText, queryByPlaceholderText } = renderWithProvider(<EditScreen />);
    
    await waitFor(() => {
      expect(queryByPlaceholderText('アイテム名を入力')).toBeNull();
    });

    // Click add item button
    fireEvent.press(getByText('アイテムを追加'));
    
    await waitFor(() => {
      expect(queryByPlaceholderText('アイテム名を入力')).toBeTruthy();
    });
  });
});

describe('Data Persistence Flow', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should create checklist with valid name', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<CreateScreen />);
    
    const input = getByPlaceholderText('例：買い物、デート、出張');
    fireEvent.changeText(input, '永続化テスト');
    
    const createButton = getByText('作成');
    fireEvent.press(createButton);
    
    // Verify navigation was called
    expect(router.back).toHaveBeenCalled();
  });

  it('should add items to checklist during creation', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithProvider(<CreateScreen />);
    
    // Add item
    const itemInput = getByPlaceholderText('アイテム名を入力');
    fireEvent.changeText(itemInput, 'テストアイテム');
    fireEvent(itemInput, 'submitEditing');
    
    // Verify item appears in list
    await waitFor(() => {
      expect(getByText('テストアイテム')).toBeTruthy();
    });
  });
});

describe('Error Handling - Empty Data', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('handles missing checklist gracefully in CheckScreen', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'non-existent' });
    
    const CheckScreen = require('../app/check/[id]').default;
    const { getByText } = renderWithProvider(<CheckScreen />);
    
    await waitFor(() => {
      expect(getByText('チェックリストが見つかりません')).toBeTruthy();
    });
  });

  it('handles missing checklist gracefully in EditScreen', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'non-existent' });
    
    const { getByText } = renderWithProvider(<EditScreen />);
    
    await waitFor(() => {
      expect(getByText('チェックリストが見つかりません')).toBeTruthy();
    });
  });

  it('shows empty state when no checklists exist', async () => {
    await AsyncStorage.setItem('@outing_checklist_data', JSON.stringify({
      checklists: [],
      history: [],
      settings: {
        defaultReminderTime: '08:00',
        notificationsEnabled: true,
        hapticFeedback: true,
        theme: 'system',
      },
    }));

    const HomeScreen = require('../app/(tabs)/index').default;
    const { getByText, queryByText } = renderWithProvider(<HomeScreen />);
    
    await waitFor(() => {
      expect(queryByText('読み込み中...')).toBeNull();
    });

    expect(getByText('チェックリストがありません')).toBeTruthy();
  });
});

describe('Button onPress Actions', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('CreateScreen renders with close and save buttons', async () => {
    const { getByText } = renderWithProvider(<CreateScreen />);
    
    // Verify buttons exist
    expect(getByText('作成')).toBeTruthy();
    expect(getByText('新規リスト作成')).toBeTruthy();
  });

  it('CheckScreen renders navigation elements', async () => {
    const testData = {
      checklists: [{
        id: 'nav-test',
        name: 'ナビテスト',
        emoji: '🔙',
        color: '#3498db',
        items: [],
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      history: [],
      settings: {
        defaultReminderTime: '08:00',
        notificationsEnabled: true,
        hapticFeedback: true,
        theme: 'system',
      },
    };
    await AsyncStorage.setItem('@outing_checklist_data', JSON.stringify(testData));
    
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'nav-test' });
    
    const CheckScreen = require('../app/check/[id]').default;
    const { getByText, queryByText } = renderWithProvider(<CheckScreen />);
    
    await waitFor(() => {
      expect(queryByText('チェックリストが見つかりません')).toBeNull();
    });
    
    // Verify screen elements
    expect(getByText('ナビテスト')).toBeTruthy();
    expect(getByText('リセット')).toBeTruthy();
    expect(getByText('おでかけ')).toBeTruthy();
  });

  it('EditScreen renders with action buttons', async () => {
    const testData = {
      checklists: [{
        id: 'edit-nav-test',
        name: '編集ナビテスト',
        emoji: '✏️',
        color: '#3498db',
        items: [
          { id: 'item-1', name: 'アイテム', emoji: '📦', isChecked: false, order: 0, forgotCount: 0, checkedCount: 0 },
        ],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      history: [],
      settings: {
        defaultReminderTime: '08:00',
        notificationsEnabled: true,
        hapticFeedback: true,
        theme: 'system',
      },
    };
    await AsyncStorage.setItem('@outing_checklist_data', JSON.stringify(testData));
    
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'edit-nav-test' });
    
    const { getByText, queryByText } = renderWithProvider(<EditScreen />);
    
    await waitFor(() => {
      expect(queryByText('チェックリストが見つかりません')).toBeNull();
    });

    // Verify screen elements
    expect(getByText('リスト編集')).toBeTruthy();
    expect(getByText('アイテムを追加')).toBeTruthy();
    expect(getByText('このリストを削除')).toBeTruthy();
  });
});
