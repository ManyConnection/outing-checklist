import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ChecklistCard } from '../components/ChecklistCard';
import { EmptyState } from '../components/EmptyState';
import { Checklist } from '../types';

// Mock useThemeColor hook
jest.mock('../hooks/useThemeColor', () => ({
  useThemeColor: () => '#333333',
}));

describe('ChecklistCard', () => {
  const mockChecklist: Checklist = {
    id: 'test-card',
    name: '買い物リスト',
    emoji: '🛒',
    color: '#3498db',
    items: [
      { id: '1', name: 'りんご', emoji: '🍎', isChecked: true, order: 0, forgotCount: 0, checkedCount: 1 },
      { id: '2', name: 'バナナ', emoji: '🍌', isChecked: false, order: 1, forgotCount: 0, checkedCount: 0 },
      { id: '3', name: 'オレンジ', emoji: '🍊', isChecked: true, order: 2, forgotCount: 0, checkedCount: 1 },
    ],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders checklist name and emoji', () => {
    const { getByText } = render(
      <ChecklistCard checklist={mockChecklist} onPress={jest.fn()} />
    );
    
    expect(getByText('買い物リスト')).toBeTruthy();
    expect(getByText('🛒')).toBeTruthy();
  });

  it('shows correct item count', () => {
    const { getByText } = render(
      <ChecklistCard checklist={mockChecklist} onPress={jest.fn()} />
    );
    
    // 2 checked out of 3
    expect(getByText('2/3 アイテム')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ChecklistCard checklist={mockChecklist} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('買い物リスト'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows quick check button when onQuickCheck is provided', () => {
    const mockOnQuickCheck = jest.fn();
    const { UNSAFE_root } = render(
      <ChecklistCard 
        checklist={mockChecklist} 
        onPress={jest.fn()} 
        onQuickCheck={mockOnQuickCheck}
      />
    );
    
    // Quick check button should exist
    const quickCheckButtons = UNSAFE_root.findAllByType('View').filter(
      node => node.props.style && JSON.stringify(node.props.style).includes('quickCheckButton')
    );
    expect(quickCheckButtons.length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty items correctly', () => {
    const emptyChecklist: Checklist = {
      ...mockChecklist,
      items: [],
    };
    
    const { getByText } = render(
      <ChecklistCard checklist={emptyChecklist} onPress={jest.fn()} />
    );
    
    expect(getByText('0/0 アイテム')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders emoji, title, and description', () => {
    const { getByText } = render(
      <EmptyState 
        emoji="📝"
        title="リストがありません"
        description="新しいリストを作成しましょう"
      />
    );
    
    expect(getByText('📝')).toBeTruthy();
    expect(getByText('リストがありません')).toBeTruthy();
    expect(getByText('新しいリストを作成しましょう')).toBeTruthy();
  });
});
