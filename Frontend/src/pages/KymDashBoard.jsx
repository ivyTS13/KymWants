import { useCallback, useMemo, useState, useEffect } from "react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import useUserStore from "../store/useUserStore";
import useCollectionStore from "../store/useCollectionStore";
import Layout from "../components/KymLayout";
import DropZone from "../components/DropZone";
import useDashboardDnd from "../hooks/useDashboardDnd";
import CollectionSidebar from "../components/dashboard/CollectionSidebar";
import DishGrid from "../components/dashboard/DishGrid";
import QuickListForm from "../components/dashboard/QuickListForm";
import WheelStage from "../components/dashboard/WheelStage";
import DashboardModals from "../components/dashboard/DashboardModals";
import {
  WheelIcon,
  BookMenuIcon,
  EditPencilIcon,
  TrashIcon,
  MagicWandIcon,
} from "../components/icons/UiIcons";

export default function KymDashboard() {
  // Atomic User State Selector
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // Atomic Collection State Selectors
  const myCollections = useCollectionStore((state) => state.myCollections);
  const activeTab = useCollectionStore((state) => state.activeTab);
  const setActiveTab = useCollectionStore((state) => state.setActiveTab);
  const selectedCollection = useCollectionStore((state) => state.selectedCollection);
  const setSelectedCollection = useCollectionStore((state) => state.setSelectedCollection);
  const clearSelection = useCollectionStore((state) => state.clearSelection);
  const fetchMyCollections = useCollectionStore((state) => state.fetchMyCollections);
  const retryFetchMyCollections = useCollectionStore((state) => state.retryFetchMyCollections);
  const createCollection = useCollectionStore((state) => state.createCollection);
  const deleteCollection = useCollectionStore((state) => state.deleteCollection);
  const wheelDishes = useCollectionStore((state) => state.wheelDishes);
  const toggleWheelDish = useCollectionStore((state) => state.toggleWheelDish);
  const setWheelDishes = useCollectionStore((state) => state.setWheelDishes);
  const isLoading = useCollectionStore((state) => state.isLoading);
  const isCreatingDishLoading = useCollectionStore((state) => state.isCreatingDishLoading);
  const isDeletingDishLoading = useCollectionStore((state) => state.isDeletingDishLoading);
  const deleteDish = useCollectionStore((state) => state.deleteDish);
  const error = useCollectionStore((state) => state.error);
  const clearError = useCollectionStore((state) => state.clearError);

  // Local collection form state
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  // Grouped Modal Domain States
  const [dishModal, setDishModal] = useState({
    isOpen: false,
    mode: "create",
    dish: null,
  });
  const [collectionModal, setCollectionModal] = useState({
    isOpen: false,
    collection: null,
  });
  const [deleteTarget, setDeleteTarget] = useState({
    isOpen: false,
    type: null,
    item: null,
  });
  const [winnerDish, setWinnerDish] = useState(null);

  // Custom Tab State
  const [customText, setCustomText] = useState("");
  const [customDishes, setCustomDishes] = useState([]);

  // Mobile view switcher state ('inventory' or 'wheel')
  const [mobileView, setMobileView] = useState("wheel");

  // Modal Handlers
  const openCreateDishModal = useCallback(() => {
    setDishModal({ isOpen: true, mode: "create", dish: null });
  }, []);

  const openEditDishModal = useCallback((dish) => {
    setDishModal({ isOpen: true, mode: "edit", dish });
  }, []);

  const closeDishModal = useCallback(() => {
    setDishModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleEditCollectionRequest = useCallback((collection) => {
    setCollectionModal({ isOpen: true, collection });
  }, []);

  const closeCollectionModal = useCallback(() => {
    setCollectionModal({ isOpen: false, collection: null });
  }, []);

  const handleDeleteDishRequest = useCallback((dish) => {
    setDeleteTarget({ isOpen: true, type: "dish", item: dish });
  }, []);

  const handleDeleteCollectionRequest = useCallback((collection) => {
    setDeleteTarget({ isOpen: true, type: "collection", item: collection });
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteTarget({ isOpen: false, type: null, item: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget.type === "dish" && deleteTarget.item) {
      await deleteDish(deleteTarget.item.id);
    } else if (deleteTarget.type === "collection" && deleteTarget.item) {
      await deleteCollection(deleteTarget.item.id);
    }
    closeDeleteConfirm();
  }, [deleteTarget, deleteDish, deleteCollection, closeDeleteConfirm]);

  const {
    sensors,
    activeDragType,
    activeDragDish,
    activeDragCollection,
    isDropZoneVisible,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDashboardDnd({
    selectedCollection,
    myCollections,
    customDishes,
    onEditDish: openEditDishModal,
    onDeleteDish: handleDeleteDishRequest,
    onEditCollection: handleEditCollectionRequest,
    onDeleteCollection: handleDeleteCollectionRequest,
  });

  useEffect(() => {
    if (isAuthenticated && myCollections.length === 0 && !error) {
      fetchMyCollections();
    }
  }, [isAuthenticated, fetchMyCollections, myCollections.length, error]);

  const selectedDishIds = useMemo(
    () => new Set(wheelDishes.map((d) => d.id)),
    [wheelDishes]
  );

  const handleCreateCollection = useCallback(
    async (e) => {
      e.preventDefault();
      if (newCollectionName.trim()) {
        const result = await createCollection(newCollectionName.trim());
        if (result?.success !== false) {
          setNewCollectionName("");
          setIsCreatingCollection(false);
        }
      }
    },
    [newCollectionName, createCollection]
  );

  const handleGenerateCustomList = useCallback(() => {
    const lines = customText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const newDishes = lines.map((line, index) => ({
      id: `custom-${index}-${Date.now()}`,
      name: line,
      isCustom: true,
    }));
    setCustomDishes(newDishes);
  }, [customText]);

  const handleSelectAllDishes = useCallback(() => {
    if (selectedCollection?.dishes) {
      setWheelDishes(selectedCollection.dishes);
    }
  }, [selectedCollection, setWheelDishes]);

  const handleClearAllDishes = useCallback(() => {
    setWheelDishes([]);
  }, [setWheelDishes]);

  return (
    <Layout>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Mobile View Toggle Bar */}
        <div className="flex lg:hidden mb-3 bg-white p-1 rounded-2xl border border-earth-rust/15 shadow-xs">
          <button
            onClick={() => setMobileView("wheel")}
            aria-pressed={mobileView === "wheel"}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mobileView === "wheel"
                ? "bg-earth-rust text-white shadow-xs"
                : "text-earth-maroon/70 hover:text-earth-maroon hover:bg-earth-beige/50"
            }`}
          >
            <WheelIcon className="w-3.5 h-3.5" />
            <span>Spin Wheel ({wheelDishes.length})</span>
          </button>
          <button
            onClick={() => setMobileView("inventory")}
            aria-pressed={mobileView === "inventory"}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              mobileView === "inventory"
                ? "bg-earth-rust text-white shadow-xs"
                : "text-earth-maroon/70 hover:text-earth-maroon hover:bg-earth-beige/50"
            }`}
          >
            <BookMenuIcon className="w-3.5 h-3.5" />
            <span>Menus & Items</span>
          </button>
        </div>

        {/* Main Dashboard Container */}
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-8.5vmax)] lg:h-[calc(100dvh-7.5rem)] bg-white/90 backdrop-blur-md border border-earth-rust/20 rounded-3xl shadow-xl overflow-hidden font-sans text-earth-maroon">
          {/* Sidebar / Inventory Area */}
          <div
            className={`w-full lg:w-5/12 xl:w-4/12 bg-earth-beige/30 border-r border-earth-rust/15 flex flex-col h-full ${
              mobileView === "inventory" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Segmented Pill Tabs */}
            <div className="p-3 border-b border-earth-rust/10 bg-white/60 shrink-0">
              <div
                role="tablist"
                aria-label="Menu types"
                className="flex p-1 bg-earth-beige/80 rounded-2xl border border-earth-rust/10"
              >
                <button
                  role="tab"
                  id="tab-my"
                  aria-selected={activeTab === "my"}
                  aria-controls="panel-my"
                  onClick={() => setActiveTab("my")}
                  className={`flex-1 py-2 px-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "my"
                      ? "bg-white text-earth-maroon shadow-xs"
                      : "text-earth-maroon/60 hover:text-earth-maroon"
                  }`}
                >
                  <BookMenuIcon className="w-3.5 h-3.5" />
                  <span>My Collections</span>
                </button>
                <button
                  role="tab"
                  id="tab-custom"
                  aria-selected={activeTab === "custom"}
                  aria-controls="panel-custom"
                  onClick={() => setActiveTab("custom")}
                  className={`flex-1 py-2 px-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "custom"
                      ? "bg-white text-earth-maroon shadow-xs"
                      : "text-earth-maroon/60 hover:text-earth-maroon"
                  }`}
                >
                  <MagicWandIcon className="w-3.5 h-3.5" />
                  <span>Quick List</span>
                </button>
              </div>
            </div>

            {/* Scrollable Sidebar Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {/* Error banner if present */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-2xl text-xs flex justify-between items-center animate-in fade-in">
                  <span>{error}</span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={retryFetchMyCollections}
                      className="font-bold underline hover:text-red-900"
                    >
                      Retry
                    </button>
                    <button
                      onClick={clearError}
                      aria-label="Dismiss error"
                      className="text-red-500 hover:text-red-800 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Single Universal Drop Zone Bar */}
              <div
                className={`flex gap-2 transition-all duration-200 overflow-hidden shrink-0 ${
                  isDropZoneVisible
                    ? "h-14 opacity-100 mb-1"
                    : "h-0 opacity-0 mb-0"
                }`}
              >
                <DropZone id="edit-drop" type="edit">
                  <EditPencilIcon className="w-3.5 h-3.5" />
                  <span>Edit Item</span>
                </DropZone>
                <DropZone id="delete-drop" type="delete">
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Remove Item</span>
                </DropZone>
              </div>

              {activeTab === "custom" ? (
                <QuickListForm
                  customText={customText}
                  setCustomText={setCustomText}
                  onGenerate={handleGenerateCustomList}
                  customDishes={customDishes}
                  selectedDishIds={selectedDishIds}
                  onToggleDish={toggleWheelDish}
                />
              ) : !selectedCollection ? (
                <CollectionSidebar
                  isAuthenticated={isAuthenticated}
                  isCreatingCollection={isCreatingCollection}
                  setIsCreatingCollection={setIsCreatingCollection}
                  newCollectionName={newCollectionName}
                  setNewCollectionName={setNewCollectionName}
                  handleCreateCollection={handleCreateCollection}
                  isLoading={isLoading}
                  myCollections={myCollections}
                  onSelectCollection={setSelectedCollection}
                  onEditCollection={handleEditCollectionRequest}
                  onDeleteCollection={handleDeleteCollectionRequest}
                />
              ) : (
                <DishGrid
                  selectedCollection={selectedCollection}
                  onBack={clearSelection}
                  onSelectAll={handleSelectAllDishes}
                  onClearAll={handleClearAllDishes}
                  isCreatingDishLoading={isCreatingDishLoading}
                  onOpenCreateDish={openCreateDishModal}
                  selectedDishIds={selectedDishIds}
                  onToggleDish={toggleWheelDish}
                  onEditDish={openEditDishModal}
                  onDeleteDish={handleDeleteDishRequest}
                />
              )}
            </div>
          </div>

          {/* Main Wheel Area */}
          <WheelStage
            wheelDishes={wheelDishes}
            onWinnerSelected={setWinnerDish}
            mobileView={mobileView}
          />
        </div>

        {/* Custom Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
          {activeDragType === "dish" && activeDragDish ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-earth-rust shadow-xl bg-white rotate-3">
              {activeDragDish.profileImageUrl ? (
                <img
                  src={activeDragDish.profileImageUrl}
                  alt={activeDragDish.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-earth-beige flex items-center justify-center p-1">
                  <span className="text-earth-maroon text-[10px] font-bold text-center">
                    {activeDragDish.name}
                  </span>
                </div>
              )}
            </div>
          ) : activeDragType === "collection" && activeDragCollection ? (
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-earth-rust shadow-xl w-48 rotate-3 opacity-90">
              <h3 className="font-bold text-earth-maroon text-sm">
                {activeDragCollection.name}
              </h3>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Decoupled Modals Coordinator */}
      <DashboardModals
        dishModal={dishModal}
        onCloseDishModal={closeDishModal}
        selectedCollectionId={selectedCollection?.id}
        collectionModal={collectionModal}
        onCloseCollectionModal={closeCollectionModal}
        deleteTarget={deleteTarget}
        isDeleting={isDeletingDishLoading}
        onCancelDelete={closeDeleteConfirm}
        onConfirmDelete={handleDeleteConfirm}
        winnerDish={winnerDish}
        onCloseWinnerModal={() => setWinnerDish(null)}
      />
    </Layout>
  );
}
