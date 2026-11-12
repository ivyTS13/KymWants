import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickListForm from '../components/dashboard/QuickListForm';

describe('QuickListForm', () => {
  it('renders input elements and triggers text updates and generate callback', () => {
    const handleSetText = vi.fn();
    const handleGenerate = vi.fn();

    render(
      <QuickListForm
        customText="Ramen"
        setCustomText={handleSetText}
        onGenerate={handleGenerate}
        customDishes={[]}
        selectedDishIds={new Set()}
        onToggleDish={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(/Enter dishes/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Ramen');

    fireEvent.change(textarea, { target: { value: 'Sushi' } });
    expect(handleSetText).toHaveBeenCalledWith('Sushi');

    const button = screen.getByRole('button', { name: /Generate Dishes/i });
    fireEvent.click(button);
    expect(handleGenerate).toHaveBeenCalledTimes(1);
  });

  it('renders generated custom dishes and forwards toggle events', () => {
    const handleToggleDish = vi.fn();
    const customDishes = [
      { id: 'custom-0', name: 'Matcha Boba', isCustom: true },
      { id: 'custom-1', name: 'Takoyaki', isCustom: true },
    ];
    const selectedDishIds = new Set(['custom-0']);

    render(
      <QuickListForm
        customText=""
        setCustomText={vi.fn()}
        onGenerate={vi.fn()}
        customDishes={customDishes}
        selectedDishIds={selectedDishIds}
        onToggleDish={handleToggleDish}
      />
    );

    expect(screen.getByText('Matcha Boba')).toBeInTheDocument();
    expect(screen.getByText('Takoyaki')).toBeInTheDocument();

    const takoyakiCard = screen.getByText('Takoyaki').closest('div[role="button"], button') || screen.getByText('Takoyaki');
    fireEvent.click(takoyakiCard);
    expect(handleToggleDish).toHaveBeenCalledWith(customDishes[1]);
  });
});
