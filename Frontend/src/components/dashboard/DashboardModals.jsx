import DishModal from "../DishModal";
import CollectionModal from "../CollectionModal";
import DeleteConfirmModal from "../DeleteConfirmModal";
import WinnerModal from "../WinnerModal";

export default function DashboardModals({
  isDishModalOpen,
  onCloseDishModal,
  dishModalMode,
  selectedCollection,
  editingDish,
  isCollectionModalOpen,
  onCloseCollectionModal,
  editingCollection,
  isDeleteConfirmOpen,
  dishToDelete,
  collectionToDelete,
  isDeletingDishLoading,
  onCancelDelete,
  onConfirmDelete,
  winnerPopupDish,
  onCloseWinnerModal,
}) {
  return (
    <>
      {/* Dish Creation/Edit Modal */}
      <DishModal
        isOpen={isDishModalOpen}
        onClose={onCloseDishModal}
        mode={dishModalMode}
        collectionId={selectedCollection?.id}
        initialDish={editingDish}
      />

      {/* Collection Edit Modal */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={onCloseCollectionModal}
        initialCollection={editingCollection}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        dishToDelete={dishToDelete}
        collectionToDelete={collectionToDelete}
        isDeletingDishLoading={isDeletingDishLoading}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {/* Winner Popup Modal */}
      <WinnerModal
        dish={winnerPopupDish}
        onClose={onCloseWinnerModal}
      />
    </>
  );
}
