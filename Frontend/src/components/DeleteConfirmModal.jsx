import Modal from "./ui/Modal";
import { TrashIcon, SpinnerIcon } from "./icons/UiIcons";

export default function DeleteConfirmModal({
  isOpen,
  dishToDelete,
  collectionToDelete,
  itemToDelete,
  title,
  description,
  isDeletingDishLoading: isDeleting = false,
  onCancel,
  onConfirm,
}) {
  const targetName =
    itemToDelete ||
    (collectionToDelete ? collectionToDelete.name : dishToDelete?.name);

  const isVisible = Boolean(
    isOpen && (dishToDelete || collectionToDelete || itemToDelete)
  );

  const modalTitle =
    title ||
    (collectionToDelete
      ? "Delete Collection?"
      : dishToDelete
        ? "Delete Dish?"
        : "Delete Item?");

  return (
    <Modal
      isOpen={isVisible}
      onClose={onCancel}
      maxWidth="max-w-xs"
      showCloseButton={false}
      ariaLabelledBy="delete-modal-title"
    >
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
          <TrashIcon className="w-5 h-5" />
        </div>

        <h3
          id="delete-modal-title"
          className="text-base font-bold text-earth-maroon mb-1 font-display"
        >
          {modalTitle}
        </h3>

        <p className="text-xs text-earth-maroon/70 mb-5 leading-relaxed">
          {description || (
            <>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-earth-maroon">
                "{targetName}"
              </span>
              ? This cannot be undone.
            </>
          )}
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 bg-earth-beige/60 text-earth-maroon font-bold text-xs py-2.5 rounded-full hover:bg-earth-beige transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-full transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
