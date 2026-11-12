import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DishModal from '../components/DishModal';
import useCollectionStore from '../store/useCollectionStore';

describe('DishModal Flow', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    useCollectionStore.setState({
      isCreatingDishLoading: false,
      isUpdatingDishLoading: false,
    });
    URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('renders in create mode and submits new dish', async () => {
    const handleClose = vi.fn();
    const mockCreateDish = vi.fn().mockResolvedValue({ success: true });
    useCollectionStore.setState({ createDish: mockCreateDish });

    render(
      <DishModal
        isOpen={true}
        onClose={handleClose}
        mode="create"
        collectionId={42}
      />
    );

    expect(screen.getByText('Add New Dish')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Dish Name \*/i);
    const descInput = screen.getByLabelText(/Description/i);
    const submitBtn = screen.getByRole('button', { name: /Add Dish/i });

    fireEvent.change(nameInput, { target: { value: 'Matcha Souffle' } });
    fireEvent.change(descInput, { target: { value: 'Fluffy and sweet' } });

    // File upload simulation
    const file = new File(['dummy content'], 'matcha.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Upload dish photo/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    const previewImg = screen.getByRole('img', { name: /Matcha Souffle/i });
    expect(previewImg).toHaveAttribute('src', 'blob:mock-preview-url');

    fireEvent.click(submitBtn);

    expect(mockCreateDish).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        name: 'Matcha Souffle',
        description: 'Fluffy and sweet',
        profileImage: file,
      })
    );

    // Should close on success
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('renders in edit mode with initial data and surfaces submit errors', async () => {
    const handleClose = vi.fn();
    const mockUpdateDish = vi.fn().mockResolvedValue({
      success: false,
      error: 'Duplicate dish name not allowed',
    });
    useCollectionStore.setState({ updateDish: mockUpdateDish });

    const initialDish = {
      id: 99,
      name: 'Tempura Udon',
      description: 'Hot broth with tempura',
      categoryId: 2,
      profileImageUrl: 'https://cdn.example.com/udon.jpg',
    };

    render(
      <DishModal
        isOpen={true}
        onClose={handleClose}
        mode="edit"
        initialDish={initialDish}
      />
    );

    expect(screen.getByText('Edit Dish Details')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Dish Name \*/i);
    expect(nameInput.value).toBe('Tempura Udon');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    expect(mockUpdateDish).toHaveBeenCalledWith(
      99,
      expect.objectContaining({
        name: 'Tempura Udon',
      })
    );

    // On failure, error message should be displayed and modal remains open
    expect(await screen.findByText('Duplicate dish name not allowed')).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
  });
});
