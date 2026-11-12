import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDashboardDnd from '../hooks/useDashboardDnd';

describe('useDashboardDnd', () => {
  const mockDish = { id: 'd-1', name: 'Ramen', isCustom: false };
  const mockCustomDish = { id: 'c-1', name: 'Quick Fries', isCustom: true };
  const mockCollection = { id: '10', name: 'Favorites' };

  const defaultProps = {
    selectedCollection: { id: 'col-1', dishes: [mockDish] },
    myCollections: [mockCollection],
    customDishes: [mockCustomDish],
    onEditDish: vi.fn(),
    onDeleteDish: vi.fn(),
    onEditCollection: vi.fn(),
    onDeleteCollection: vi.fn(),
  };

  it('manages drag state and shows drop zones for standard dishes but not custom dishes', () => {
    const { result } = renderHook(() => useDashboardDnd(defaultProps));

    expect(result.current.isDropZoneVisible).toBe(false);

    // Drag standard dish
    act(() => {
      result.current.handleDragStart({
        active: {
          id: 'd-1',
          data: { current: { type: 'dish', dish: mockDish } },
        },
      });
    });

    expect(result.current.activeDragId).toBe('d-1');
    expect(result.current.activeDragType).toBe('dish');
    expect(result.current.activeDragDish).toEqual(mockDish);
    expect(result.current.isDropZoneVisible).toBe(true);

    // Cancel drag
    act(() => {
      result.current.handleDragCancel();
    });

    expect(result.current.activeDragId).toBe(null);
    expect(result.current.isDropZoneVisible).toBe(false);

    // Drag custom dish
    act(() => {
      result.current.handleDragStart({
        active: {
          id: 'c-1',
          data: { current: { type: 'dish', dish: mockCustomDish } },
        },
      });
    });

    expect(result.current.isDropZoneVisible).toBe(false);
  });

  it('dispatches edit and delete actions on valid drop zones', () => {
    const onEditDish = vi.fn();
    const onDeleteDish = vi.fn();
    const onEditCollection = vi.fn();
    const onDeleteCollection = vi.fn();

    const { result } = renderHook(() =>
      useDashboardDnd({
        ...defaultProps,
        onEditDish,
        onDeleteDish,
        onEditCollection,
        onDeleteCollection,
      })
    );

    // Drop dish over edit-drop
    act(() => {
      result.current.handleDragEnd({
        active: { data: { current: { type: 'dish', dish: mockDish } } },
        over: { id: 'edit-drop' },
      });
    });
    expect(onEditDish).toHaveBeenCalledWith(mockDish);

    // Drop dish over delete-drop
    act(() => {
      result.current.handleDragEnd({
        active: { data: { current: { type: 'dish', dish: mockDish } } },
        over: { id: 'delete-drop' },
      });
    });
    expect(onDeleteDish).toHaveBeenCalledWith(mockDish);

    // Drop collection over edit-drop
    act(() => {
      result.current.handleDragEnd({
        active: { data: { current: { type: 'collection', collection: mockCollection } } },
        over: { id: 'edit-drop' },
      });
    });
    expect(onEditCollection).toHaveBeenCalledWith(mockCollection);

    // Drop collection over delete-drop
    act(() => {
      result.current.handleDragEnd({
        active: { data: { current: { type: 'collection', collection: mockCollection } } },
        over: { id: 'delete-drop' },
      });
    });
    expect(onDeleteCollection).toHaveBeenCalledWith(mockCollection);
  });

  it('ignores drop actions for custom dishes', () => {
    const onEditDish = vi.fn();
    const onDeleteDish = vi.fn();

    const { result } = renderHook(() =>
      useDashboardDnd({
        ...defaultProps,
        onEditDish,
        onDeleteDish,
      })
    );

    act(() => {
      result.current.handleDragEnd({
        active: { data: { current: { type: 'dish', dish: mockCustomDish } } },
        over: { id: 'delete-drop' },
      });
    });

    expect(onDeleteDish).not.toHaveBeenCalled();
    expect(onEditDish).not.toHaveBeenCalled();
  });
});
