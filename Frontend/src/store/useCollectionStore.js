import { create } from "zustand";
import apiClient from "../api/axios";

const useCollectionStore = create((set, get) => ({
  sharedCollections: [],
  myCollections: [],
  activeTab: "shared",
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

  toggleWheelDish: (dish) => {
    const currentDishes = get().wheelDishes;
    const isSelected = currentDishes.some((d) => d.id === dish.id);
    if (isSelected) {
      set({ wheelDishes: currentDishes.filter((d) => d.id !== dish.id) });
    } else {
      set({ wheelDishes: [...currentDishes, dish] });
    }
  },

  fetchSharedCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/Collections/shared");
      set({ sharedCollections: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMyCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get("/Collections/me");
      set({ myCollections: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
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
    } catch (error) {
      console.error("Failed to create collection", error);
    }
  },

  createDish: async (collectionId, dishData) => {
    set({ isCreatingDishLoading: true });
    try {
      const formData = new FormData();
      formData.append("name", dishData.name);
      formData.append("description", dishData.description || "");
      formData.append("categoryId", 1);
      formData.append("collectionId", collectionId);
      if (dishData.profileImage) {
        formData.append("ProfileImageUrl", dishData.profileImage);
      }

      const response = await apiClient.post("/Dishes", formData, {
        headers: { "Content-Type": undefined },
      });

      const newDish = response.data;

      // Update selectedCollection
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
      set({ myCollections: updatedCollections });
    } catch (error) {
      console.error("Failed to add dish", error);
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
      formData.append("categoryId", dishData.categoryId);
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
              d.id === dishId ? updatedDish : d,
            ),
          },
        });
      }

      // Update myCollections
      const updatedCollections = get().myCollections.map((col) => {
        if (col.dishes?.some((d) => d.id === dishId)) {
          return {
            ...col,
            dishes: col.dishes.map((d) => (d.id === dishId ? updatedDish : d)),
          };
        }
        return col;
      });
      set({ myCollections: updatedCollections });
    } catch (error) {
      console.error("Failed to update dish", error);
    } finally {
      set({ isUpdatingDishLoading: false });
    }
  },

  deleteDish: async (dishId) => {
    set({ isDeletingDishLoading: true });
    try {
      await apiClient.delete(`/Dishes/${dishId}`);

      // Update selectedCollection
      const currentSelected = get().selectedCollection;
      if (currentSelected) {
        set({
          selectedCollection: {
            ...currentSelected,
            dishes:
              currentSelected.dishes?.filter((d) => d.id !== dishId) || [],
          },
        });
      }

      // Update myCollections
      const updatedCollections = get().myCollections.map((col) => ({
        ...col,
        dishes: col.dishes?.filter((d) => d.id !== dishId) || [],
      }));
      set({ myCollections: updatedCollections });

      // Remove from wheelDishes if present
      const wheelDishes = get().wheelDishes.filter((d) => d.id !== dishId);
      set({ wheelDishes });
    } catch (error) {
      console.error("Failed to delete dish", error);
    } finally {
      set({ isDeletingDishLoading: false });
    }
  },
}));

export default useCollectionStore;
