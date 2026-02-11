import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Checklist, CheckHistory, AppSettings, ChecklistItem } from '@/types';
import { createDefaultChecklists } from '@/constants/DefaultChecklists';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@outing_checklist_data';

const defaultSettings: AppSettings = {
  defaultReminderTime: '08:00',
  notificationsEnabled: true,
  hapticFeedback: true,
  theme: 'system',
};

const initialState: AppState = {
  checklists: [],
  history: [],
  settings: defaultSettings,
};

type Action =
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'ADD_CHECKLIST'; payload: Checklist }
  | { type: 'UPDATE_CHECKLIST'; payload: Checklist }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: { checklistId: string; itemId: string } }
  | { type: 'RESET_CHECKLIST'; payload: string }
  | { type: 'ADD_ITEM'; payload: { checklistId: string; item: ChecklistItem } }
  | { type: 'UPDATE_ITEM'; payload: { checklistId: string; item: ChecklistItem } }
  | { type: 'DELETE_ITEM'; payload: { checklistId: string; itemId: string } }
  | { type: 'REORDER_ITEMS'; payload: { checklistId: string; items: ChecklistItem[] } }
  | { type: 'SAVE_CHECK_HISTORY'; payload: CheckHistory }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RECORD_FORGOTTEN_ITEM'; payload: { checklistId: string; itemId: string } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'ADD_CHECKLIST':
      return {
        ...state,
        checklists: [...state.checklists, action.payload],
      };

    case 'UPDATE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.filter((c) => c.id !== action.payload),
      };

    case 'TOGGLE_ITEM':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: c.items.map((item) => {
              if (item.id !== action.payload.itemId) return item;
              const newChecked = !item.isChecked;
              return {
                ...item,
                isChecked: newChecked,
                checkedCount: newChecked ? item.checkedCount + 1 : item.checkedCount,
              };
            }),
          };
        }),
      };

    case 'RESET_CHECKLIST':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload) return c;
          return {
            ...c,
            items: c.items.map((item) => ({ ...item, isChecked: false })),
          };
        }),
      };

    case 'ADD_ITEM':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: [...c.items, action.payload.item],
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: c.items.map((item) =>
              item.id === action.payload.item.id ? action.payload.item : item
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: c.items.filter((item) => item.id !== action.payload.itemId),
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case 'REORDER_ITEMS':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: action.payload.items,
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case 'SAVE_CHECK_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 100), // 最新100件のみ保持
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'RECORD_FORGOTTEN_ITEM':
      return {
        ...state,
        checklists: state.checklists.map((c) => {
          if (c.id !== action.payload.checklistId) return c;
          return {
            ...c,
            items: c.items.map((item) => {
              if (item.id !== action.payload.itemId) return item;
              return { ...item, forgotCount: item.forgotCount + 1 };
            }),
          };
        }),
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage on state change
  useEffect(() => {
    if (!isLoading) {
      saveData(state);
    }
  }, [state, isLoading]);

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue) as AppState;
        dispatch({ type: 'LOAD_DATA', payload: data });
      } else {
        // Initialize with default checklists
        const defaultData: AppState = {
          checklists: createDefaultChecklists(),
          history: [],
          settings: defaultSettings,
        };
        dispatch({ type: 'LOAD_DATA', payload: defaultData });
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      // Initialize with defaults on error
      const defaultData: AppState = {
        checklists: createDefaultChecklists(),
        history: [],
        settings: defaultSettings,
      };
      dispatch({ type: 'LOAD_DATA', payload: defaultData });
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper hooks
export function useChecklists() {
  const { state, dispatch } = useApp();
  return {
    checklists: state.checklists,
    addChecklist: (checklist: Checklist) =>
      dispatch({ type: 'ADD_CHECKLIST', payload: checklist }),
    updateChecklist: (checklist: Checklist) =>
      dispatch({ type: 'UPDATE_CHECKLIST', payload: checklist }),
    deleteChecklist: (id: string) =>
      dispatch({ type: 'DELETE_CHECKLIST', payload: id }),
  };
}

export function useChecklist(id: string) {
  const { state, dispatch } = useApp();
  const checklist = state.checklists.find((c) => c.id === id);

  return {
    checklist,
    toggleItem: (itemId: string) =>
      dispatch({ type: 'TOGGLE_ITEM', payload: { checklistId: id, itemId } }),
    resetChecklist: () => dispatch({ type: 'RESET_CHECKLIST', payload: id }),
    addItem: (item: ChecklistItem) =>
      dispatch({ type: 'ADD_ITEM', payload: { checklistId: id, item } }),
    updateItem: (item: ChecklistItem) =>
      dispatch({ type: 'UPDATE_ITEM', payload: { checklistId: id, item } }),
    deleteItem: (itemId: string) =>
      dispatch({ type: 'DELETE_ITEM', payload: { checklistId: id, itemId } }),
    reorderItems: (items: ChecklistItem[]) =>
      dispatch({ type: 'REORDER_ITEMS', payload: { checklistId: id, items } }),
  };
}

export function useHistory() {
  const { state, dispatch } = useApp();
  return {
    history: state.history,
    saveHistory: (history: CheckHistory) =>
      dispatch({ type: 'SAVE_CHECK_HISTORY', payload: history }),
  };
}

export function useSettings() {
  const { state, dispatch } = useApp();
  return {
    settings: state.settings,
    updateSettings: (settings: Partial<AppSettings>) =>
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
  };
}
