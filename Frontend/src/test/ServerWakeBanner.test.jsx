import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ServerWakeBanner from '../components/ui/ServerWakeBanner';
import useServerWakeStore from '../store/useServerWakeStore';
import useUserStore from '../store/useUserStore';

describe('ServerWakeBanner', () => {
  beforeEach(() => {
    useServerWakeStore.getState().resetSlowRequests();
    useUserStore.setState({ isCheckingAuth: false });
  });

  it('does not render when isServerWaking is false', () => {
    render(<ServerWakeBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders status pill when isServerWaking is true and auth check is done', () => {
    useServerWakeStore.getState().incrementSlowRequests();

    render(<ServerWakeBanner />);

    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveTextContent('Waking up server, this may take ~30 seconds…');
  });

  it('hides while isCheckingAuth is true to avoid overlapping the splash screen', () => {
    useServerWakeStore.getState().incrementSlowRequests();
    useUserStore.setState({ isCheckingAuth: true });

    render(<ServerWakeBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
