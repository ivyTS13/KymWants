import Modal from "./ui/Modal";
import { SparklesIcon, UtensilsIcon } from "./icons/UiIcons";

export default function WinnerModal({ dish, onClose }) {
  return (
    <Modal
      isOpen={Boolean(dish)}
      onClose={onClose}
      maxWidth="max-w-sm"
      showCloseButton={false}
      ariaLabelledBy="winner-modal-title"
    >
      <div className="p-6 text-center relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-earth-rust/10 blur-2xl pointer-events-none"
        />

        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-earth-beige/60 hover:bg-earth-beige flex items-center justify-center text-earth-maroon/60 hover:text-earth-maroon transition-colors text-base leading-none"
          >
            ×
          </button>
        </div>

        {/* Celebratory Badge */}
        <div
          aria-hidden="true"
          className="w-14 h-14 rounded-2xl bg-earth-rust/10 text-earth-rust mx-auto flex items-center justify-center mb-3 shadow-xs border border-earth-rust/20"
        >
          <SparklesIcon className="w-7 h-7 motion-safe:animate-bounce" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-earth-rust bg-earth-rust/10 px-3 py-1 rounded-full border border-earth-rust/20 mb-2">
          Today's Pick
        </span>

        {/* Dish image preview if available */}
        {dish?.profileImageUrl && (
          <div className="w-24 h-24 mx-auto my-3 rounded-2xl overflow-hidden border border-earth-rust/20 shadow-sm">
            <img
              src={dish.profileImageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h2
          id="winner-modal-title"
          className="text-2xl font-extrabold text-earth-maroon mt-1 mb-1 tracking-tight font-display"
        >
          {dish?.name}
        </h2>

        {dish?.categoryName && (
          <p className="text-xs text-earth-maroon/60 mb-5">
            Category:{" "}
            <span className="font-semibold text-earth-maroon/80">
              {dish.categoryName}
            </span>
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-earth-rust hover:bg-earth-maroon text-white font-bold text-sm py-3 rounded-full transition-all duration-150 shadow-sm hover:shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-earth-rust"
          >
            <UtensilsIcon className="w-4 h-4" />
            <span>Sounds Great, Let's Eat</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
