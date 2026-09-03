import { useCallback, useMemo, useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import useUserStore from "../store/useUserStore";
import useCollectionStore from "../store/useCollectionStore";
import Layout from "../components/KymLayout";
import FortuneWheel from "../components/FortuneWheel";
import DishModal from "../components/DishModal";
import DraggableDishCard from "../components/DraggableDiscard";
import DropZone from "../components/DropZone";
import DraggableCollectionItem from "../components/DraggableCollectionItem";
import CollectionModal from "../components/CollectionModal";

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
    createCollection,
    deleteCollection,
    wheelDishes,
    toggleWheelDish,
    setWheelDishes,
    isLoading,
    isCreatingDishLoading,
    isDeletingDishLoading,
    deleteDish,
  } = useCollectionStore();

  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishModalMode, setDishModalMode] = useState("create");
  const [editingDish, setEditingDish] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
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
  const [activeDragType, setActiveDragType] = useState(null);

  const activeDragDish = activeDragId
    ? selectedCollection?.dishes?.find((d) => d.id === activeDragId) ||
      customDishes.find((d) => d.id === activeDragId)
    : null;

  const activeDragCollection =
    activeDragId && activeDragType === "collection"
      ? myCollections.find((c) => `col-${c.id}` === activeDragId)
      : null;

  // Smart visibility check: true if dragging a standard dish OR a collection
  const isDropZoneVisible =
    (activeDragType === "dish" && activeDragDish && !activeDragDish.isCustom) ||
    (activeDragType === "collection" && activeDragCollection);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  useEffect(() => {
    if (isAuthenticated && myCollections.length === 0) {
      fetchMyCollections();
    }
  }, [isAuthenticated, fetchMyCollections, myCollections.length]);

  const selectedDishIds = useMemo(
    () => new Set(wheelDishes.map((d) => d.id)),
    [wheelDishes],
  );

  const handleCreateCollection = useCallback(
    (e) => {
      e.preventDefault();
      if (newCollectionName.trim()) {
        createCollection(newCollectionName.trim());
        setNewCollectionName("");
        setIsCreatingCollection(false);
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

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
    setActiveDragType(event.active.data.current?.type);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);

    if (over && active.data.current) {
      const { type, dish, collection } = active.data.current;

      if (type === "dish" && !dish.isCustom) {
        if (over.id === "edit-drop") openEditDishModal(dish);
        else if (over.id === "delete-drop") {
          setDishToDelete(dish);
          setIsDeleteConfirmOpen(true);
        }
      } else if (type === "collection") {
        if (over.id === "edit-drop") {
          setEditingCollection(collection);
          setIsCollectionModalOpen(true);
        } else if (over.id === "delete-drop") {
          setCollectionToDelete(collection);
          setIsDeleteConfirmOpen(true);
        }
      }
    }
  };

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
        onDragCancel={() => {
          setActiveDragId(null);
          setActiveDragType(null);
        }}
      >
        {/* Mobile View Toggle Bar */}
        <div className="flex lg:hidden mb-3 bg-earth-green/20 p-1 rounded-xl border border-earth-rust/30">
          <button
            onClick={() => setMobileView("wheel")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileView === "wheel"
                ? "bg-earth-rust text-earth-beige shadow"
                : "text-earth-maroon hover:bg-earth-beige/50"
            }`}
          >
            🎡 Spin Wheel ({wheelDishes.length})
          </button>
          <button
            onClick={() => setMobileView("inventory")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileView === "inventory"
                ? "bg-earth-rust text-earth-beige shadow"
                : "text-earth-maroon hover:bg-earth-beige/50"
            }`}
          >
            🎒 Menus & Inventory
          </button>
        </div>

        {/* Main Dashboard Container */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5vmax)] lg:h-[calc(100vh-7rem)] bg-white border border-earth-rust/30 rounded-2xl shadow-xl overflow-hidden font-sans text-earth-maroon">
          {/* Sidebar / Inventory Area */}
          <div
            className={`w-full lg:w-5/12 xl:w-4/12 bg-earth-beige/40 border-r border-earth-rust/20 flex flex-col h-full ${
              mobileView === "inventory" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Tabs */}
            <div className="flex border-b border-earth-rust/20 bg-earth-green/10 shrink-0">
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 py-3 px-3 font-bold text-xs transition-all border-r border-earth-rust/20 ${
                  activeTab === "custom"
                    ? "bg-white text-earth-maroon shadow-sm"
                    : "text-earth-maroon/60 hover:bg-white/40"
                }`}
              >
                Custom Menu
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 py-3 px-3 font-bold text-xs transition-all ${
                  activeTab === "my"
                    ? "bg-white text-earth-maroon shadow-sm"
                    : "text-earth-maroon/60 hover:bg-white/40"
                }`}
              >
                My Collections
              </button>
            </div>

            {/* Scrollable Sidebar Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {/* Single Universal Drop Zone Bar */}
              <div
                className={`flex gap-2 transition-all duration-200 overflow-hidden shrink-0 ${
                  isDropZoneVisible
                    ? "h-16 opacity-100 mb-1"
                    : "h-0 opacity-0 mb-0"
                }`}
              >
                <DropZone id="edit-drop" type="edit">
                  <span className="text-xs font-bold text-earth-maroon">
                    🔧 Edit
                  </span>
                </DropZone>
                <DropZone id="delete-drop" type="delete">
                  <span className="text-xs font-bold text-red-700">
                    🗑️ Trash
                  </span>
                </DropZone>
              </div>

              {activeTab === "custom" ? (
                /* CUSTOM MENU VIEW */
                <div className="flex flex-col gap-3 h-full">
                  <div className="bg-white p-3 rounded-xl border border-earth-rust/20 shadow-sm flex flex-col gap-2 shrink-0">
                    <label className="text-xs font-bold text-earth-maroon">
                      Enter dishes (one per line):
                    </label>
                    <textarea
                      className="w-full bg-earth-beige/20 border border-earth-rust/40 rounded-lg p-2 text-xs text-earth-maroon focus:outline-none focus:border-earth-rust resize-none h-28"
                      placeholder="fries&#10;boba tea&#10;pho&#10;seafood boil"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                    <button
                      onClick={handleGenerateCustomList}
                      className="bg-earth-rust text-earth-beige text-xs font-bold py-2 rounded-lg hover:bg-earth-maroon transition-colors"
                    >
                      Generate Custom Menu
                    </button>
                  </div>

                  {customDishes.length > 0 && (
                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-3">
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
                <>
                  {isAuthenticated &&
                    (isCreatingCollection ? (
                      <form
                        onSubmit={handleCreateCollection}
                        className="p-3 bg-white rounded-xl border border-earth-rust/30 shadow-sm"
                      >
                        <input
                          autoFocus
                          type="text"
                          placeholder="Menu name..."
                          className="w-full bg-earth-beige/40 border border-earth-rust/40 rounded px-3 py-2 text-xs font-medium text-earth-maroon focus:outline-none focus:border-earth-rust mb-2"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-earth-rust text-earth-beige text-xs font-bold py-1.5 rounded-lg hover:bg-earth-maroon"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreatingCollection(false)}
                            className="flex-1 bg-gray-100 text-earth-maroon text-xs font-bold py-1.5 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCreatingCollection(true)}
                        className="p-3 rounded-xl border border-dashed border-earth-rust/40 hover:border-earth-rust text-earth-maroon font-bold text-xs transition-all flex items-center justify-center gap-1 bg-white shadow-sm hover:bg-earth-beige/50"
                      >
                        <span>+</span> New Menu
                      </button>
                    ))}

                  {myCollections.length === 0 &&
                    !isLoading &&
                    !isCreatingCollection && (
                      <div className="text-center font-medium text-earth-maroon/60 p-6 text-sm">
                        {isAuthenticated
                          ? "No collections found."
                          : "Log in to view collections."}
                      </div>
                    )}

                  <div className="flex flex-col gap-2.5">
                    {myCollections.map((col) => (
                      <DraggableCollectionItem
                        key={col.id}
                        collection={col}
                        onClick={setSelectedCollection}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* SELECTED COLLECTION DETAILS VIEW */
                <div className="flex flex-col gap-3 h-full">
                  <button
                    onClick={clearSelection}
                    className="text-earth-rust font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-earth-rust/30 rounded-lg shadow-sm w-fit hover:bg-earth-beige transition-all"
                  >
                    ← Back to lists
                  </button>

                  <div className="bg-white p-3.5 rounded-xl border border-earth-rust/20 shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-earth-maroon text-sm">
                        {selectedCollection.name}
                      </h3>
                      <p className="text-[11px] text-earth-maroon/60 mt-0.5">
                        By {selectedCollection.userName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setWheelDishes(selectedCollection.dishes || [])
                        }
                        className="p-1.5 text-earth-rust bg-earth-rust/10 hover:bg-earth-rust hover:text-white rounded-md transition-all shadow-sm flex items-center justify-center"
                        title="Select All Dishes"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setWheelDishes([])}
                        className="p-1.5 text-earth-maroon/50 bg-earth-beige/50 hover:bg-earth-beige hover:text-earth-maroon rounded-md transition-all shadow-sm border border-earth-rust/20 flex items-center justify-center"
                        title="Unselect All Dishes"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Grid Container for dishes */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-3">
                      {isCreatingDishLoading ? (
                        <div className="aspect-square rounded-xl bg-gray-100 animate-pulse border border-earth-rust/20" />
                      ) : (
                        <button
                          onClick={openCreateDishModal}
                          className="aspect-square rounded-xl border border-dashed border-earth-rust/40 hover:border-earth-rust text-earth-maroon/60 hover:text-earth-maroon font-bold transition-all flex flex-col items-center justify-center gap-1 bg-white shadow-sm"
                        >
                          <span className="text-lg">+</span>
                          <span className="text-[9px]">Add</span>
                        </button>
                      )}

                      {selectedCollection.dishes?.map((dish) => (
                        <DraggableDishCard
                          key={dish.id}
                          dish={dish}
                          isSelected={selectedDishIds.has(dish.id)}
                          onToggle={toggleWheelDish}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Wheel Area */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto bg-earth-green/5 ${
              mobileView === "wheel" ? "flex" : "hidden lg:flex"
            }`}
          >
            {wheelDishes.length > 0 ? (
              <div className="z-10 flex flex-col items-center w-full max-w-lg">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-earth-maroon mb-1">
                    What should we eat?
                  </h2>
                  <p className="text-earth-maroon/70 text-xs">
                    {wheelDishes.length} dishes queued on the wheel
                  </p>
                </div>

                <FortuneWheel
                  dishes={wheelDishes}
                  onWinnerSelected={setWinnerPopupDish}
                />
              </div>
            ) : (
              <div className="z-10 flex flex-col items-center justify-center text-center max-w-sm p-8 bg-white rounded-2xl border border-earth-rust/20 shadow-sm">
                <div className="text-4xl mb-3">🍽️</div>
                <h3 className="font-bold text-earth-maroon text-base mb-1">
                  No dishes selected
                </h3>
                <p className="text-earth-maroon/70 text-xs">
                  Click dishes from your loaded menu on the left (or toggle to
                  the Inventory tab) to add them to your spin wheel!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
          {activeDragType === "dish" && activeDragDish ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-earth-rust shadow-xl bg-white rotate-3">
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
            <div className="p-3 bg-white rounded-xl border-2 border-dashed border-earth-rust shadow-xl w-48 rotate-3 opacity-90">
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
      {isDeleteConfirmOpen && (dishToDelete || collectionToDelete) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/40 backdrop-blur-xs">
          <div className="bg-earth-beige rounded-2xl border border-earth-rust/30 shadow-xl w-full max-w-xs p-6 text-center">
            <h3 className="text-base font-bold text-earth-maroon mb-2">
              {collectionToDelete ? "Delete Menu?" : "Delete Dish?"}
            </h3>
            <p className="text-xs text-earth-maroon/70 mb-5">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-earth-maroon">
                {collectionToDelete
                  ? collectionToDelete.name
                  : dishToDelete.name}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDishToDelete(null);
                  setCollectionToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-earth-maroon font-bold text-xs py-2 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeletingDishLoading}
                className="flex-1 bg-red-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingDishLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Popup Modal */}
      {winnerPopupDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-earth-beige rounded-2xl border-2 border-earth-rust shadow-2xl w-full max-w-sm p-6 text-center transform animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-earth-rust text-earth-beige mx-auto flex items-center justify-center text-3xl mb-3 shadow-md">
              🎉
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-earth-rust bg-earth-rust/10 px-2 py-0.5 rounded-full">
              We Have a Winner!
            </span>
            <h2 className="text-2xl font-bold text-earth-maroon mt-2 mb-1">
              {winnerPopupDish.name}
            </h2>
            {winnerPopupDish.categoryName && (
              <p className="text-xs text-earth-maroon/70 mb-6">
                Category:{" "}
                <span className="font-semibold">
                  {winnerPopupDish.categoryName}
                </span>
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setWinnerPopupDish(null)}
                className="w-full bg-earth-rust text-earth-beige font-bold text-sm py-2.5 rounded-xl hover:bg-earth-maroon transition-colors shadow"
              >
                Let's Eat! 🍜
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
