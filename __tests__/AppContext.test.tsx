import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AppProvider, 
  useApp, 
  useChecklists, 
  useChecklist, 
  useHistory, 
  useSettings 
} from '../store/AppContext';
import { Checklist, ChecklistItem, CheckHistory, AppSettings } from '../types';

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('useApp hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useApp());
      }).toThrow('useApp must be used within an AppProvider');
      
      spy.mockRestore();
    });

    it('should provide initial state', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.state).toBeDefined();
      expect(result.current.state.checklists).toBeDefined();
      expect(result.current.state.history).toBeDefined();
      expect(result.current.state.settings).toBeDefined();
    });
  });

  describe('useChecklists hook', () => {
    it('should add a new checklist', async () => {
      const { result } = renderHook(() => useChecklists(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklists).toBeDefined();
      });

      const initialLength = result.current.checklists.length;
      
      const newChecklist: Checklist = {
        id: 'test-id-1',
        name: 'テストリスト',
        emoji: '🎒',
        color: '#FF5733',
        items: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addChecklist(newChecklist);
      });

      expect(result.current.checklists.length).toBe(initialLength + 1);
      expect(result.current.checklists.find(c => c.id === 'test-id-1')).toBeTruthy();
    });

    it('should update an existing checklist', async () => {
      const { result } = renderHook(() => useChecklists(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklists).toBeDefined();
      });

      const newChecklist: Checklist = {
        id: 'test-id-2',
        name: 'オリジナル名',
        emoji: '🎒',
        color: '#FF5733',
        items: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addChecklist(newChecklist);
      });

      const updatedChecklist = { ...newChecklist, name: '更新後の名前' };
      
      act(() => {
        result.current.updateChecklist(updatedChecklist);
      });

      const foundChecklist = result.current.checklists.find(c => c.id === 'test-id-2');
      expect(foundChecklist?.name).toBe('更新後の名前');
    });

    it('should delete a checklist', async () => {
      const { result } = renderHook(() => useChecklists(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklists).toBeDefined();
      });

      const newChecklist: Checklist = {
        id: 'test-id-3',
        name: '削除するリスト',
        emoji: '🎒',
        color: '#FF5733',
        items: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addChecklist(newChecklist);
      });

      expect(result.current.checklists.find(c => c.id === 'test-id-3')).toBeTruthy();

      act(() => {
        result.current.deleteChecklist('test-id-3');
      });

      expect(result.current.checklists.find(c => c.id === 'test-id-3')).toBeFalsy();
    });
  });

  describe('useChecklist hook - item operations', () => {
    const testChecklistId = 'checklist-with-items';
    
    beforeEach(async () => {
      // Pre-populate AsyncStorage with a checklist
      const testData = {
        checklists: [{
          id: testChecklistId,
          name: 'アイテムテスト',
          emoji: '📦',
          color: '#3498db',
          items: [
            {
              id: 'item-1',
              name: 'スマホ',
              emoji: '📱',
              isChecked: false,
              order: 0,
              forgotCount: 0,
              checkedCount: 0,
            },
            {
              id: 'item-2',
              name: '財布',
              emoji: '👛',
              isChecked: false,
              order: 1,
              forgotCount: 0,
              checkedCount: 0,
            },
          ],
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
    });

    it('should toggle item checked state', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      expect(result.current.checklist!.items[0].isChecked).toBe(false);

      act(() => {
        result.current.toggleItem('item-1');
      });

      expect(result.current.checklist!.items[0].isChecked).toBe(true);
      expect(result.current.checklist!.items[0].checkedCount).toBe(1);
    });

    it('should toggle item back to unchecked without incrementing checkedCount', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      // Toggle on
      act(() => {
        result.current.toggleItem('item-1');
      });
      expect(result.current.checklist!.items[0].isChecked).toBe(true);
      expect(result.current.checklist!.items[0].checkedCount).toBe(1);

      // Toggle off
      act(() => {
        result.current.toggleItem('item-1');
      });
      expect(result.current.checklist!.items[0].isChecked).toBe(false);
      expect(result.current.checklist!.items[0].checkedCount).toBe(1); // Count should not increase
    });

    it('should reset all items in checklist', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      // Check all items
      act(() => {
        result.current.toggleItem('item-1');
        result.current.toggleItem('item-2');
      });

      expect(result.current.checklist!.items.every(i => i.isChecked)).toBe(true);

      // Reset
      act(() => {
        result.current.resetChecklist();
      });

      expect(result.current.checklist!.items.every(i => !i.isChecked)).toBe(true);
    });

    it('should add a new item', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      const initialCount = result.current.checklist!.items.length;

      const newItem: ChecklistItem = {
        id: 'new-item',
        name: '鍵',
        emoji: '🔑',
        isChecked: false,
        order: 2,
        forgotCount: 0,
        checkedCount: 0,
      };

      act(() => {
        result.current.addItem(newItem);
      });

      expect(result.current.checklist!.items.length).toBe(initialCount + 1);
      expect(result.current.checklist!.items.find(i => i.id === 'new-item')).toBeTruthy();
    });

    it('should delete an item', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      expect(result.current.checklist!.items.find(i => i.id === 'item-1')).toBeTruthy();

      act(() => {
        result.current.deleteItem('item-1');
      });

      expect(result.current.checklist!.items.find(i => i.id === 'item-1')).toBeFalsy();
    });

    it('should reorder items', async () => {
      const { result } = renderHook(() => useChecklist(testChecklistId), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklist).toBeDefined();
      });

      const reorderedItems = [
        { ...result.current.checklist!.items[1], order: 0 },
        { ...result.current.checklist!.items[0], order: 1 },
      ];

      act(() => {
        result.current.reorderItems(reorderedItems);
      });

      expect(result.current.checklist!.items[0].id).toBe('item-2');
      expect(result.current.checklist!.items[1].id).toBe('item-1');
    });
  });

  describe('useHistory hook', () => {
    it('should save check history', async () => {
      const { result } = renderHook(() => useHistory(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.history).toBeDefined();
      });

      const newHistory: CheckHistory = {
        id: 'history-1',
        checklistId: 'checklist-1',
        checklistName: 'テストリスト',
        date: new Date().toISOString(),
        totalItems: 5,
        checkedItems: 4,
        forgottenItems: ['財布'],
      };

      act(() => {
        result.current.saveHistory(newHistory);
      });

      expect(result.current.history.length).toBeGreaterThan(0);
      expect(result.current.history[0].id).toBe('history-1');
    });

    it('should limit history to 100 entries', async () => {
      const { result } = renderHook(() => useHistory(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.history).toBeDefined();
      });

      // Add 105 history entries
      for (let i = 0; i < 105; i++) {
        act(() => {
          result.current.saveHistory({
            id: `history-${i}`,
            checklistId: 'checklist-1',
            checklistName: 'テストリスト',
            date: new Date().toISOString(),
            totalItems: 5,
            checkedItems: 5,
            forgottenItems: [],
          });
        });
      }

      expect(result.current.history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('useSettings hook', () => {
    it('should update settings', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.settings).toBeDefined();
      });

      act(() => {
        result.current.updateSettings({ hapticFeedback: false });
      });

      expect(result.current.settings.hapticFeedback).toBe(false);
    });

    it('should preserve other settings when updating one', async () => {
      const { result } = renderHook(() => useSettings(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.settings).toBeDefined();
      });

      const originalTheme = result.current.settings.theme;

      act(() => {
        result.current.updateSettings({ notificationsEnabled: false });
      });

      expect(result.current.settings.theme).toBe(originalTheme);
      expect(result.current.settings.notificationsEnabled).toBe(false);
    });
  });

  describe('AsyncStorage persistence', () => {
    it('should persist data to AsyncStorage', async () => {
      const { result } = renderHook(() => useChecklists(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.checklists).toBeDefined();
      });

      const newChecklist: Checklist = {
        id: 'persist-test',
        name: '永続化テスト',
        emoji: '💾',
        color: '#9b59b6',
        items: [],
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.addChecklist(newChecklist);
      });

      // Wait for AsyncStorage to be called
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      // Verify data was saved
      const savedData = await AsyncStorage.getItem('@outing_checklist_data');
      expect(savedData).toBeTruthy();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.checklists.find((c: Checklist) => c.id === 'persist-test')).toBeTruthy();
    });

    it('should load data from AsyncStorage on init', async () => {
      // Pre-set data in AsyncStorage
      const presetData = {
        checklists: [{
          id: 'preloaded',
          name: 'プリロード済み',
          emoji: '📥',
          color: '#e74c3c',
          items: [],
          isCustom: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        history: [],
        settings: {
          defaultReminderTime: '09:00',
          notificationsEnabled: false,
          hapticFeedback: false,
          theme: 'dark',
        },
      };
      await AsyncStorage.setItem('@outing_checklist_data', JSON.stringify(presetData));

      const { result } = renderHook(() => useApp(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.state.checklists.find(c => c.id === 'preloaded')).toBeTruthy();
      expect(result.current.state.settings.notificationsEnabled).toBe(false);
      expect(result.current.state.settings.theme).toBe('dark');
    });

    it('should initialize with defaults when AsyncStorage is empty', async () => {
      await AsyncStorage.clear();
      
      const { result } = renderHook(() => useApp(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have default checklists
      expect(result.current.state.checklists.length).toBeGreaterThan(0);
      // Should have default settings
      expect(result.current.state.settings.hapticFeedback).toBe(true);
    });

    it('should handle corrupted AsyncStorage data gracefully', async () => {
      // Set invalid JSON
      await AsyncStorage.setItem('@outing_checklist_data', 'invalid json');
      
      // Suppress error logs for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useApp(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fall back to defaults
      expect(result.current.state.checklists).toBeDefined();
      expect(result.current.state.checklists.length).toBeGreaterThan(0);
      
      consoleSpy.mockRestore();
    });
  });

  describe('RECORD_FORGOTTEN_ITEM action', () => {
    it('should increment forgotCount for an item', async () => {
      // Pre-populate with test data
      const testData = {
        checklists: [{
          id: 'forgot-test',
          name: '忘れ物テスト',
          emoji: '📦',
          color: '#3498db',
          items: [{
            id: 'forgot-item',
            name: '傘',
            emoji: '☂️',
            isChecked: false,
            order: 0,
            forgotCount: 0,
            checkedCount: 0,
          }],
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

      const { result } = renderHook(() => useApp(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.dispatch({
          type: 'RECORD_FORGOTTEN_ITEM',
          payload: { checklistId: 'forgot-test', itemId: 'forgot-item' },
        });
      });

      const checklist = result.current.state.checklists.find(c => c.id === 'forgot-test');
      expect(checklist!.items[0].forgotCount).toBe(1);
    });
  });
});
