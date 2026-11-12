import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from '../api/axios';
import ChatDialog from '../components/chat/ChatDialog';

describe('ChatDialog Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ChatDialog isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog', { name: /Foodie Companion Chat/i })).not.toBeInTheDocument();
  });

  it('renders greeting message and sends question, displaying AI markdown response', async () => {
    apiClient.post.mockResolvedValueOnce({
      data: { answer: 'Try some **Matcha Crepes** or _Takoyaki_!' },
    });

    render(<ChatDialog isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Craving something sweet, savory/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Ask for dinner or snack ideas/i);
    const sendBtn = screen.getByRole('button', { name: /Send message/i });

    fireEvent.change(input, { target: { value: 'What should I eat?' } });
    fireEvent.click(sendBtn);

    // User message should appear immediately and input should clear
    expect(screen.getByText('What should I eat?')).toBeInTheDocument();
    expect(input.value).toBe('');

    // API should be called
    expect(apiClient.post).toHaveBeenCalledWith('/Chat/ask', {
      question: 'What should I eat?',
    });

    // AI response should be rendered with markdown parsed
    await waitFor(() => {
      expect(screen.getByText('Matcha Crepes')).toBeInTheDocument();
    });
  });

  it('handles 429 rate limit error by locking input', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { message: 'Rate limit reached! Try again later.' },
      },
    });

    render(<ChatDialog isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText(/Ask for dinner or snack ideas/i);
    const sendBtn = screen.getByRole('button', { name: /Send message/i });

    fireEvent.change(input, { target: { value: 'Spam question' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('Rate limit reached! Try again later.')).toBeInTheDocument();
    });

    // Input should be disabled with rate limit placeholder
    expect(input).toBeDisabled();
    expect(screen.getByPlaceholderText(/Daily limit reached/i)).toBeInTheDocument();
  });

  it('triggers onClose when Escape key is pressed or Close button clicked', () => {
    const handleClose = vi.fn();
    render(<ChatDialog isOpen={true} onClose={handleClose} />);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /Close chat/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
