import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';
import { apiClient } from '../services/api';

vi.mock('../services/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('submits login form successfully', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        user: { id: '1', name: 'John Doe', email: 'john@example.com' },
        access_token: 'fake-token',
      },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'john@example.com',
        passwordHash: 'password123',
      });
    });
  });
});
