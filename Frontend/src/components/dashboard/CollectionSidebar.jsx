import DraggableCollectionItem from "../DraggableCollectionItem";
import { PlusIcon } from "../icons/UiIcons";

export default function CollectionSidebar({
  isAuthenticated,
  isCreatingCollection,
  setIsCreatingCollection,
  newCollectionName,
  setNewCollectionName,
  handleCreateCollection,
  isLoading,
  myCollections,
  onSelectCollection,
  onEditCollection,
  onDeleteCollection,
}) {
  return (
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

      {myCollections.length === 0 && !isLoading && !isCreatingCollection && (
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
            onClick={onSelectCollection}
            onEdit={onEditCollection}
            onDelete={onDeleteCollection}
          />
        ))}
      </div>
    </div>
  );
}
