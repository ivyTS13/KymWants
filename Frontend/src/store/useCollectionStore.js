import { create } from "zustand";
import apiClient from "../api/axios";

// Helper utilities for immutable nested collection updates
const updateDishInCollectionList = (collections, dishId, updatedDish) =>
  collections.map((col) => {
    if (col.dishes?.some((d) => d.id === dishId)) {
      return {
        ...col,
        dishes: col.dishes.map((d) => (d.id === dishId ? updatedDish : d)),
      };
    }
    return col;
  });

const removeDishFromCollectionList = (collections, dishId) =>
  collections.map((col) => ({
    ...col,
    dishes: col.dishes?.filter((d) => d.id !== dishId) || [],
  }));

const getErrorMessage = (error, fallback = "An unexpected error occurred.") =>
  error.response?.data?.message || error.message || fallback;

const useCollectionStore = create((set, get) => ({
  sharedCollections: [],
  myCollections: [],
  activeTab: "my",
  selectedCollection: null,
  wheelDishes: [],
  isLoading: false,
  isCreatingDishLoading: false,
  isUpdatingDishLoading: false,
  isDeletingDishLoading: false,
  error: null,

  setActiveTab: (tab) =>
    set({ activeTab: tab, selectedCollection: null, wheelDishes: [] }),

  setSelectedCollection: (collection) =>
    set({
      selectedCollection: collection,
      wheelDishes: [],
    }),

  clearSelection: () => set({ selectedCollection: null, wheelDishes: [] }),

  setWheelDishes: (dishes) => set({ wheelDishes: dishes }),

  toggleWheelDish: (dish) => {
    const currentDishes = get().wheelDishes;
    const isSelected = currentDishes.some((d) => d.id === dish.id);
    if (isSelected) {
      set({ wheelDishes: currentDishes.filter((d) => d.id !== dish.id) });
    } else {
      set({ wheelDishes: [...currentDishes, dish] });
    }
  },

  clearError: () => set({ error: null }),

  fetchSharedCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/Collections/shared");
      set({ sharedCollections: response.data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  fetchMyCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/Collections/me");
      set({ myCollections: response.data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  retryFetchMyCollections: async () => {
    await get().fetchMyCollections();
  },

  createCollection: async (name) => {
    try {
      const response = await apiClient.post("/Collections", {
        name,
        isShared: false,
      });
      set((state) => ({
        myCollections: [...state.myCollections, response.data],
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to create collection", error);
      const errMsg = getErrorMessage(error, "Failed to create collection");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  createDish: async (collectionId, dishData) => {
    set({ isCreatingDishLoading: true });
    try {
      const formData = new FormData();
      formData.append("name", dishData.name);
      formData.append("description", dishData.description || "");
      formData.append("categoryId", dishData.categoryId || 1);
      formData.append("collectionId", collectionId);
      if (dishData.profileImage) {
        formData.append("ProfileImageUrl", dishData.profileImage);
      }

      const response = await apiClient.post("/Dishes", formData, {
        headers: { "Content-Type": undefined },
      });

      const newDish = response.data;

      // Update selectedCollection if matching
      const currentSelected = get().selectedCollection;
      if (currentSelected && currentSelected.id === collectionId) {
        set({
          selectedCollection: {
            ...currentSelected,
            dishes: [...(currentSelected.dishes || []), newDish],
          },
        });
      }

      // Update myCollections
      const updatedCollections = get().myCollections.map((col) => {
        if (col.id === collectionId) {
          return { ...col, dishes: [...(col.dishes || []), newDish] };
        }
        return col;
      });

      // Update sharedCollections if present
      const updatedShared = get().sharedCollections.map((col) => {
        if (col.id === collectionId) {
          return { ...col, dishes: [...(col.dishes || []), newDish] };
        }
        return col;
      });

      set({
        myCollections: updatedCollections,
        sharedCollections: updatedShared,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to add dish", error);
      const errMsg = getErrorMessage(error, "Failed to add dish");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    } finally {
      set({ isCreatingDishLoading: false });
    }
  },

  updateDish: async (dishId, dishData) => {
    set({ isUpdatingDishLoading: true });
    try {
      const formData = new FormData();
      formData.append("name", dishData.name);
      formData.append("description", dishData.description || "");
      formData.append("categoryId", dishData.categoryId || 1);
      if (dishData.profileImage) {
        formData.append("ProfileImageUrl", dishData.profileImage);
      }

      const response = await apiClient.put(`/Dishes/${dishId}`, formData, {
        headers: { "Content-Type": undefined },
      });

      const updatedDish = response.data;

      // Update selectedCollection if present
      const currentSelected = get().selectedCollection;
      if (currentSelected) {
        set({
          selectedCollection: {
            ...currentSelected,
            dishes: currentSelected.dishes?.map((d) =>
              d.id === dishId ? updatedDish : d
            ),
          },
        });
      }

      // Update myCollections & sharedCollections safely
      set((state) => ({
        myCollections: updateDishInCollectionList(
          state.myCollections,
          dishId,
          updatedDish
        ),
        sharedCollections: updateDishInCollectionList(
          state.sharedCollections,
          dishId,
          updatedDish
        ),
        wheelDishes: state.wheelDishes.map((d) =>
          d.id === dishId ? updatedDish : d
        ),
      }));

      return { success: true };
    } catch (error) {
      console.error("Failed to update dish", error);
      const errMsg = getErrorMessage(error, "Failed to update dish");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    } finally {
      set({ isUpdatingDishLoading: false });
    }
  },

  updateCollection: async (collectionId, newName) => {
    try {
      const response = await apiClient.put(`/Collections/${collectionId}`, {
        name: newName,
        isShared: false,
      });

      const updatedCollection = response.data;

      set((state) => ({
        myCollections: state.myCollections.map((c) =>
          c.id === collectionId ? { ...c, name: updatedCollection.name } : c
        ),
        sharedCollections: state.sharedCollections.map((c) =>
          c.id === collectionId ? { ...c, name: updatedCollection.name } : c
        ),
        selectedCollection:
          state.selectedCollection?.id === collectionId
            ? { ...state.selectedCollection, name: updatedCollection.name }
            : state.selectedCollection,
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to update collection", error);
      const errMsg = getErrorMessage(error, "Failed to update collection");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      await apiClient.delete(`/Collections/${collectionId}`);

      set((state) => ({
        myCollections: state.myCollections.filter((c) => c.id !== collectionId),
        sharedCollections: state.sharedCollections.filter((c) => c.id !== collectionId),
        selectedCollection:
          state.selectedCollection?.id === collectionId
            ? null
            : state.selectedCollection,
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete collection", error);
      const errMsg = getErrorMessage(error, "Failed to delete collection");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  deleteDish: async (dishId) => {
    set({ isDeletingDishLoading: true });
    try {
      await apiClient.delete(`/Dishes/${dishId}`);

      set((state) => ({
        selectedCollection: state.selectedCollection
          ? {
              ...state.selectedCollection,
              dishes:
                state.selectedCollection.dishes?.filter((d) => d.id !== dishId) ||
                [],
            }
          : null,
        myCollections: removeDishFromCollectionList(
          state.myCollections,
          dishId
        ),
        sharedCollections: removeDishFromCollectionList(
          state.sharedCollections,
          dishId
        ),
        wheelDishes: state.wheelDishes.filter((d) => d.id !== dishId),
      }));

      return { success: true };
    } catch (error) {
      console.error("Failed to delete dish", error);
      const errMsg = getErrorMessage(error, "Failed to delete dish");
      set({ error: errMsg });
      return { success: false, error: errMsg };
    } finally {
      set({ isDeletingDishLoading: false });
    }
  },
}));

export default useCollectionStore;
