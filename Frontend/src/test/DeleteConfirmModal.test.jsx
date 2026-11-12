import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <DeleteConfirmModal
        isOpen={false}
        dishToDelete={{ name: 'Spicy Ramen' }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByText(/Delete Dish\?/i)).not.toBeInTheDocument();
  });

  it('renders dish delete confirmation and handles cancel and confirm clicks', () => {
    const handleCancel = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <DeleteConfirmModal
        isOpen={true}
        dishToDelete={{ name: 'Spicy Ramen' }}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText('Delete Dish?')).toBeInTheDocument();
    expect(screen.getByText(/"Spicy Ramen"/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    const deleteBtn = screen.getByRole('button', { name: /^Delete$/i });

    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(deleteBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders collection title and custom item name correctly', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        collectionToDelete={{ name: 'Boba Spots' }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Collection?')).toBeInTheDocument();
    expect(screen.getByText(/"Boba Spots"/i)).toBeInTheDocument();
  });

  it('disables buttons and displays loading indicator when deleting', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        itemToDelete="Document.pdf"
        isDeletingDishLoading={true}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    const deletingBtn = screen.getByRole('button', { name: /Deleting\.\.\./i });

    expect(cancelBtn).toBeDisabled();
    expect(deletingBtn).toBeDisabled();
  });
});
