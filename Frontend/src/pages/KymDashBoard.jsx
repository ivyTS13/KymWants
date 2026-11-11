import { useCallback, useMemo, useState, useEffect } from "react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import useUserStore from "../store/useUserStore";
import useCollectionStore from "../store/useCollectionStore";
import Layout from "../components/KymLayout";
import FortuneWheel from "../components/FortuneWheel";
import DishModal from "../components/DishModal";
import DraggableDishCard from "../components/DraggableDishCard";
import DropZone from "../components/DropZone";
import DraggableCollectionItem from "../components/DraggableCollectionItem";
import CollectionModal from "../components/CollectionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import WinnerModal from "../components/WinnerModal";
import useDashboardDnd from "../hooks/useDashboardDnd";
import {
  WheelIcon,
  BookMenuIcon,
  EditPencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
  MagicWandIcon,
  UtensilsIcon,
} from "../components/icons/UiIcons";

export default function KymDashboard() {
  const { isAuthenticated } = useUserStore();
  const {
    myCollections,
    activeTab,
    setActiveTab,
    selectedCollection,
    setSelectedCollection,
    clearSelection,
    fetchMyCollections,
    retryFetchMyCollections,
    createCollection,
    deleteCollection,
    wheelDishes,
    toggleWheelDish,
    setWheelDishes,
    isLoading,
    isCreatingDishLoading,
    isDeletingDishLoading,
    deleteDish,
    error,
    clearError,
  } = useCollectionStore();

  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishModalMode, setDishModalMode] = useState("create");
  const [editingDish, setEditingDish] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  // Custom Tab State
  const [customText, setCustomText] = useState("");
  const [customDishes, setCustomDishes] = useState([]);

  // Mobile view switcher state ('inventory' or 'wheel')
  const [mobileView, setMobileView] = useState("wheel");

  // Winner Popup state
  const [winnerPopupDish, setWinnerPopupDish] = useState(null);

  const openCreateDishModal = useCallback(() => {
    setDishModalMode("create");
    setEditingDish(null);
    setIsDishModalOpen(true);
  }, []);

  const openEditDishModal = useCallback((dish) => {
    setDishModalMode("edit");
    setEditingDish(dish);
    setIsDishModalOpen(true);
  }, []);

  const handleDeleteDishRequest = useCallback((dish) => {
    setDishToDelete(dish);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleEditCollectionRequest = useCallback((collection) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  }, []);

  const handleDeleteCollectionRequest = useCallback((collection) => {
    setCollectionToDelete(collection);
    setIsDeleteConfirmOpen(true);
  }, []);

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
    [wheelDishes],
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
    [newCollectionName, createCollection],
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

  const handleDeleteConfirm = async () => {
    if (dishToDelete) {
      await deleteDish(dishToDelete.id);
      setDishToDelete(null);
    } else if (collectionToDelete) {
      await deleteCollection(collectionToDelete.id);
      setCollectionToDelete(null);
    }
    setIsDeleteConfirmOpen(false);
  };

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
                /* QUICK / CUSTOM MENU VIEW */
                <div
                  role="tabpanel"
                  id="panel-custom"
                  aria-labelledby="tab-custom"
                  className="flex flex-col gap-3 h-full"
                >
                  <div className="bg-white p-4 rounded-3xl border border-earth-rust/15 shadow-xs flex flex-col gap-2.5 shrink-0">
                    <label
                      htmlFor="custom-menu-input"
                      className="text-xs font-bold text-earth-maroon flex items-center justify-between"
                    >
                      <span>Enter dishes (one per line):</span>
                      <span className="text-[10px] text-earth-maroon/50 font-normal">
                        e.g. Matcha latte, Udon
                      </span>
                    </label>
                    <textarea
                      id="custom-menu-input"
                      className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-2xl p-3 text-xs text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 resize-none h-28 leading-relaxed placeholder:text-earth-maroon/40"
                      placeholder="Strawberry boba&#10;Matcha waffle&#10;Tonkatsu ramen&#10;Seafood boil"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                    <button
                      onClick={handleGenerateCustomList}
                      className="inline-flex items-center justify-center gap-2 bg-earth-rust text-white text-xs font-bold py-2.5 rounded-full hover:bg-earth-maroon transition-all shadow-xs active:scale-98"
                    >
                      <MagicWandIcon className="w-3.5 h-3.5" />
                      <span>Generate Dishes</span>
                    </button>
                  </div>

                  {customDishes.length > 0 && (
                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-3">
                        {customDishes.map((dish) => (
                          <DraggableDishCard
                            key={dish.id}
                            dish={dish}
                            isSelected={selectedDishIds.has(dish.id)}
                            onToggle={toggleWheelDish}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : !selectedCollection ? (
                /* MY COLLECTIONS VIEW */
                <div
                  role="tabpanel"
                  id="panel-my"
                  aria-labelledby="tab-my"
                  className="flex flex-col gap-2.5"
                >
                  {isAuthenticated &&
                    (isCreatingCollection ? (
                      <form
                        onSubmit={handleCreateCollection}
                        className="p-3.5 bg-white rounded-3xl border border-earth-rust/25 shadow-xs"
                      >
                        <label htmlFor="new-collection-name" className="sr-only">
                          Collection Name
                        </label>
                        <input
                          id="new-collection-name"
                          autoFocus
                          type="text"
                          placeholder="Collection name (e.g., Weekend Brunch)..."
                          className="w-full bg-earth-beige/40 border border-earth-rust/30 rounded-xl px-3 py-2 text-xs font-medium text-earth-maroon focus:outline-none focus:border-earth-rust mb-2.5"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-earth-rust text-white text-xs font-bold py-2 rounded-full hover:bg-earth-maroon transition-colors shadow-xs"
                          >
                            Save Collection
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCollection(false)}
                            className="flex-1 bg-earth-beige/60 text-earth-maroon text-xs font-bold py-2 rounded-full hover:bg-earth-beige transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingCollection(true)}
                        className="p-3.5 rounded-2xl border border-dashed border-earth-rust/30 hover:border-earth-rust text-earth-maroon font-bold text-xs transition-all flex items-center justify-center gap-2 bg-white/70 shadow-xs hover:bg-white hover:shadow-sm"
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-earth-rust" />
                        <span>Create New Collection</span>
                      </button>
                    ))}

                  {/* Loading skeletons */}
                  {isLoading && (
                    <div className="flex flex-col gap-2.5">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-16 rounded-2xl bg-earth-beige/50 animate-pulse border border-earth-rust/10"
                        />
                      ))}
                    </div>
                  )}

                  {myCollections.length === 0 &&
                    !isLoading &&
                    !isCreatingCollection && (
                      <div className="text-center font-medium text-earth-maroon/60 p-8 text-xs leading-relaxed bg-white/50 rounded-3xl border border-earth-rust/10">
                        {isAuthenticated
                          ? "No collections saved yet. Create your first collection above!"
                          : "Log in to view and save your collections."}
                      </div>
                    )}

                  <div className="flex flex-col gap-2.5">
                    {myCollections.map((col) => (
                      <DraggableCollectionItem
                        key={col.id}
                        collection={col}
                        onClick={setSelectedCollection}
                        onEdit={handleEditCollectionRequest}
                        onDelete={handleDeleteCollectionRequest}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* SELECTED COLLECTION DETAILS VIEW */
                <div className="flex flex-col gap-3 h-full">
                  <button
                    onClick={clearSelection}
                    className="text-earth-rust font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-earth-rust/20 rounded-full shadow-xs w-fit hover:bg-earth-beige/60 transition-all"
                  >
                    <ArrowLeftIcon className="w-3 h-3" />
                    <span>All Collections</span>
                  </button>

                  <div className="bg-white p-3.5 rounded-2xl border border-earth-rust/15 shadow-xs flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-earth-maroon text-sm tracking-tight">
                        {selectedCollection.name}
                      </h3>
                      <p className="text-[11px] text-earth-maroon/60 mt-0.5">
                        Created by {selectedCollection.userName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setWheelDishes(selectedCollection.dishes || [])
                        }
                        className="px-2.5 py-1 text-xs font-bold text-earth-rust bg-earth-rust/10 hover:bg-earth-rust hover:text-white rounded-full transition-all shadow-xs flex items-center gap-1"
                        title="Select All Dishes"
                        aria-label="Select all dishes for the wheel"
                      >
                        <span className="text-[11px]">Select All</span>
                      </button>

                      <button
                        onClick={() => setWheelDishes([])}
                        className="px-2.5 py-1 text-xs font-medium text-earth-maroon/60 bg-earth-beige/60 hover:bg-earth-beige hover:text-earth-maroon rounded-full transition-all shadow-xs border border-earth-rust/15"
                        title="Unselect All Dishes"
                        aria-label="Unselect all dishes"
                      >
                        <span className="text-[11px]">Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Grid Container for dishes */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-3">
                      {isCreatingDishLoading ? (
                        <div className="aspect-square rounded-2xl bg-earth-beige/40 animate-pulse border border-earth-rust/20" />
                      ) : (
                        <button
                          onClick={openCreateDishModal}
                          className="aspect-square rounded-2xl border-2 border-dashed border-earth-rust/30 hover:border-earth-rust text-earth-maroon/70 hover:text-earth-rust font-bold transition-all flex flex-col items-center justify-center gap-1.5 bg-white/70 shadow-xs hover:bg-white"
                        >
                          <div className="w-7 h-7 rounded-full bg-earth-rust/10 text-earth-rust flex items-center justify-center">
                            <PlusIcon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] tracking-tight">Add Dish</span>
                        </button>
                      )}

                      {selectedCollection.dishes?.map((dish) => (
                        <DraggableDishCard
                          key={dish.id}
                          dish={dish}
                          isSelected={selectedDishIds.has(dish.id)}
                          onToggle={toggleWheelDish}
                          onEdit={openEditDishModal}
                          onDelete={handleDeleteDishRequest}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Wheel Area with Cozy Aesthetic Presentation */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-y-auto bg-gradient-to-b from-white/40 to-earth-beige/20 ${
              mobileView === "wheel" ? "flex" : "hidden lg:flex"
            }`}
          >
            {wheelDishes.length > 0 ? (
              <div className="z-10 flex flex-col items-center w-full max-w-lg">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-earth-maroon tracking-tight font-display">
                    What should we eat?
                  </h2>
                  <p className="text-earth-maroon/70 text-xs mt-1">
                    {wheelDishes.length} {wheelDishes.length === 1 ? "dish" : "dishes"} on the wheel right now
                  </p>
                </div>

                <FortuneWheel
                  dishes={wheelDishes}
                  onWinnerSelected={setWinnerPopupDish}
                />
              </div>
            ) : (
              <div className="z-10 flex flex-col items-center justify-center text-center max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-earth-rust/15 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-earth-rust/10 text-earth-rust flex items-center justify-center mb-3.5 border border-earth-rust/15">
                  <UtensilsIcon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-earth-maroon text-base mb-1 tracking-tight">
                  No dishes on the tray
                </h3>
                <p className="text-earth-maroon/65 text-xs leading-relaxed">
                  Select dishes from your saved collections or write a quick menu on the left to spin the wheel!
                </p>
              </div>
            )}
          </div>
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

      {/* Dish Creation/Edit Modal */}
      <DishModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        mode={dishModalMode}
        collectionId={selectedCollection?.id}
        initialDish={editingDish}
      />

      {/* Collection Edit Modal */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        initialCollection={editingCollection}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        dishToDelete={dishToDelete}
        collectionToDelete={collectionToDelete}
        isDeletingDishLoading={isDeletingDishLoading}
        onCancel={() => {
          setIsDeleteConfirmOpen(false);
          setDishToDelete(null);
          setCollectionToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      {/* Winner Popup Modal */}
      <WinnerModal
        dish={winnerPopupDish}
        onClose={() => setWinnerPopupDish(null)}
      />
    </Layout>
  );
}
