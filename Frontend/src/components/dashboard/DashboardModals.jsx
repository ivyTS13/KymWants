import DishModal from "../DishModal";
import CollectionModal from "../CollectionModal";
import DeleteConfirmModal from "../DeleteConfirmModal";
import WinnerModal from "../WinnerModal";

/**
 * Decoupled modal container for dashboard flows.
 * Receives grouped domain states instead of 17+ loose primitive props.
 */
export default function DashboardModals({
  dishModal,
  onCloseDishModal,
  selectedCollectionId,
  collectionModal,
  onCloseCollectionModal,
  deleteTarget,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  winnerDish,
  onCloseWinnerModal,
}) {
  return (
    <>
      {/* Dish Creation/Edit Modal */}
      <DishModal
        isOpen={Boolean(dishModal?.isOpen)}
        onClose={onCloseDishModal}
        mode={dishModal?.mode || "create"}
        collectionId={selectedCollectionId}
        initialDish={dishModal?.dish}
      />

      {/* Collection Edit Modal */}
      <CollectionModal
        isOpen={Boolean(collectionModal?.isOpen)}
        onClose={onCloseCollectionModal}
        initialCollection={collectionModal?.collection}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget?.isOpen)}
        dishToDelete={deleteTarget?.type === "dish" ? deleteTarget.item : null}
        collectionToDelete={
          deleteTarget?.type === "collection" ? deleteTarget.item : null
        }
        isDeletingDishLoading={isDeleting}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {/* Winner Popup Modal */}
      <WinnerModal dish={winnerDish} onClose={onCloseWinnerModal} />
    </>
  );
}
