import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../api/axios';
import useCollectionStore from '../store/useCollectionStore';

describe('useCollectionStore', () => {
  beforeEach(() => {
    useCollectionStore.setState({
      sharedCollections: [],
      myCollections: [],
      activeTab: 'my',
      selectedCollection: null,
      wheelDishes: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('toggles dishes on the wheel', () => {
    const dishA = { id: 1, name: 'Pizza' };
    const dishB = { id: 2, name: 'Boba' };

    act(() => {
      useCollectionStore.getState().toggleWheelDish(dishA);
    });
    expect(useCollectionStore.getState().wheelDishes).toHaveLength(1);

    act(() => {
      useCollectionStore.getState().toggleWheelDish(dishB);
    });
    expect(useCollectionStore.getState().wheelDishes).toHaveLength(2);

    act(() => {
      useCollectionStore.getState().toggleWheelDish(dishA);
    });
    expect(useCollectionStore.getState().wheelDishes).toHaveLength(1);
    expect(useCollectionStore.getState().wheelDishes[0].id).toBe(2);
  });

  it('creates collection and returns success: true', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { id: 10, name: 'Fav Snacks' } });
    let result;
    await act(async () => {
      result = await useCollectionStore.getState().createCollection('Fav Snacks');
    });
    expect(result.success).toBe(true);
    expect(useCollectionStore.getState().myCollections).toHaveLength(1);
    expect(useCollectionStore.getState().myCollections[0].name).toBe('Fav Snacks');
  });

  it('surfaces error and returns success: false on failure', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('Network error'));
    let result;
    await act(async () => {
      result = await useCollectionStore.getState().createCollection('Fails');
    });
    expect(result.success).toBe(false);
    expect(useCollectionStore.getState().error).toBe('Network error');
  });

  it('clearError resets error to null', () => {
    act(() => {
      useCollectionStore.setState({ error: 'Some error' });
    });
    expect(useCollectionStore.getState().error).toBe('Some error');
    act(() => {
      useCollectionStore.getState().clearError();
    });
    expect(useCollectionStore.getState().error).toBe(null);
  });
});
