import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Faqs from '../pages/Faqs';
import { apiClient } from '../services/api';

vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </ChakraProvider>
  );
};

describe('FAQs Page', () => {
  it('renders FAQs and handles search', async () => {
    const mockFaqs = [
      { _id: '1', question: 'How to reset password?', answer: 'Click forgot password.', helpfulCount: 0, unhelpfulCount: 0 },
    ];
    (apiClient.get as any).mockResolvedValueOnce({ data: mockFaqs });

    renderWithProviders(<Faqs />);

    expect(screen.getByText(/How can we help?/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('How to reset password?')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search for answers.../i);
    (apiClient.post as any).mockResolvedValueOnce({ data: [] });
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/faqs/search', { query: 'test' });
    });
  });
});
