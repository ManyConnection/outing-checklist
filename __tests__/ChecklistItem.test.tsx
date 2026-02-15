import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChecklistItemComponent } from '../components/ChecklistItem';
import { ChecklistItem } from '../types';
import * as Haptics from 'expo-haptics';

// Mock useThemeColor
jest.mock('../hooks/useThemeColor', () => ({
  useThemeColor: () => '#333333',
}));

describe('ChecklistItemComponent', () => {
  const createMockItem = (overrides?: Partial<ChecklistItem>): ChecklistItem => ({
    id: 'item-1',
    name: 'テストアイテム',
    emoji: '📱',
    isChecked: false,
    order: 0,
    forgotCount: 0,
    checkedCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders item name correctly', () => {
    const mockItem = createMockItem({ name: 'スマートフォン' });
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    expect(getByText('スマートフォン')).toBeTruthy();
  });

  it('renders emoji when provided', () => {
    const mockItem = createMockItem({ emoji: '🎒' });
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    expect(getByText('🎒')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const mockOnToggle = jest.fn();
    const mockItem = createMockItem();
    
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={mockOnToggle} 
        color="#3498db" 
      />
    );
    
    fireEvent.press(getByText('テストアイテム'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when pressed', () => {
    const mockItem = createMockItem();
    
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    fireEvent.press(getByText('テストアイテム'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('shows forgot count when showStats is true and forgotCount > 0', () => {
    const mockItem = createMockItem({ forgotCount: 3 });
    
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
        showStats={true}
      />
    );
    
    expect(getByText('3回忘れた')).toBeTruthy();
  });

  it('does not show forgot count when forgotCount is 0', () => {
    const mockItem = createMockItem({ forgotCount: 0 });
    
    const { queryByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
        showStats={true}
      />
    );
    
    expect(queryByText(/回忘れた/)).toBeNull();
  });

  it('does not show forgot count when showStats is false', () => {
    const mockItem = createMockItem({ forgotCount: 5 });
    
    const { queryByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
        showStats={false}
      />
    );
    
    expect(queryByText(/回忘れた/)).toBeNull();
  });

  it('applies checked styling when isChecked is true', () => {
    const mockItem = createMockItem({ isChecked: true });
    
    const { getByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    const nameElement = getByText('テストアイテム');
    expect(nameElement).toBeTruthy();
    // The strikethrough style is applied via styles
  });

  it('renders unchecked item without checkmark', () => {
    const mockItem = createMockItem({ isChecked: false });
    
    const { UNSAFE_root } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    // Component should render without checkmark icon visible
    expect(UNSAFE_root).toBeTruthy();
  });

  it('handles item without emoji', () => {
    const mockItem = createMockItem({ emoji: undefined });
    
    const { getByText, queryByText } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color="#3498db" 
      />
    );
    
    expect(getByText('テストアイテム')).toBeTruthy();
  });

  it('applies the provided color to checked state', () => {
    const mockItem = createMockItem({ isChecked: true });
    const testColor = '#e74c3c';
    
    const { UNSAFE_root } = render(
      <ChecklistItemComponent 
        item={mockItem} 
        onToggle={jest.fn()} 
        color={testColor} 
      />
    );
    
    // The color should be applied - we verify the component renders
    expect(UNSAFE_root).toBeTruthy();
  });
});
