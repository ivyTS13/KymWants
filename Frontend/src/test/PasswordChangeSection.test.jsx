import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from '../api/axios';
import PasswordChangeSection from '../components/profile/PasswordChangeSection';

describe('PasswordChangeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error without submitting if new password and confirm password mismatch', async () => {
    render(<PasswordChangeSection />);

    const oldInput = screen.getByLabelText(/Current Password/i);
    const newInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(oldInput, { target: { value: 'OldPass123' } });
    fireEvent.change(newInput, { target: { value: 'NewPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });

    fireEvent.click(submitBtn);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/New passwords do not match\./i);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('submits password change and clears inputs on success', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(<PasswordChangeSection />);

    const oldInput = screen.getByLabelText(/Current Password/i);
    const newInput = screen.getByLabelText(/^New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    const submitBtn = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(oldInput, { target: { value: 'OldSecret!' } });
    fireEvent.change(newInput, { target: { value: 'BrandNewSecret!' } });
    fireEvent.change(confirmInput, { target: { value: 'BrandNewSecret!' } });

    fireEvent.click(submitBtn);

    expect(apiClient.post).toHaveBeenCalledWith('/Auth/change-password', {
      oldPassword: 'OldSecret!',
      newPassword: 'BrandNewSecret!',
    });

    const successMessage = await screen.findByRole('status');
    expect(successMessage).toHaveTextContent(/Password changed successfully!/i);

    expect(oldInput.value).toBe('');
    expect(newInput.value).toBe('');
    expect(confirmInput.value).toBe('');
  });

  it('renders API error message on change failure', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { data: { message: 'Incorrect current password.' } },
    });

    render(<PasswordChangeSection />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'WrongPass' } });
    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'ValidPass123' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'ValidPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Incorrect current password\./i);
  });
});
