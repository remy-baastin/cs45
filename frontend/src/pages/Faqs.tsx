import {
  Box,
  Heading,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  useToast,
  Skeleton,
} from '@chakra-ui/react';
import { Search, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  helpfulCount: number;
  unhelpfulCount: number;
}

export default function Faqs() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const toast = useToast();

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['faqs', searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await apiClient.post('/faqs/search', { query: searchQuery });
        return res.data;
      }
      const res = await apiClient.get('/faqs');
      return res.data;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: { faqId: string; isHelpful: boolean }) =>
      apiClient.post('/faqs/feedback', {
        faqId: data.faqId,
        isHelpful: data.isHelpful,
        queryText: searchQuery || 'direct browse',
        confidenceScore: 1.0,
        userId: user?.id,
      }),
    onSuccess: () => {
      toast({ title: 'Feedback received!', status: 'success', duration: 2000 });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (faqId: string) => apiClient.post(`/faqs/${faqId}/bookmark`),
    onSuccess: () => {
      toast({ title: 'Bookmark toggled!', status: 'success', duration: 2000 });
    },
  });

  return (
    <Container maxW={'4xl'} py={10}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            How can we help?
          </Heading>
          <Text fontSize="xl" color="gray.500">
            Search our AI-powered FAQ database
          </Text>
        </Box>

        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <Search color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={useAuthStore.getState().token ? 'transparent' : 'gray.50'}
          />
        </InputGroup>

        {isLoading ? (
          <Stack>
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </Stack>
        ) : (
          <Accordion allowMultiple>
            {faqs?.map((faq) => (
              <AccordionItem key={faq._id} border="none" mb={4} bg="gray.800" borderRadius="md">
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.400', color: 'white' }} borderRadius="md">
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text mb={4}>{faq.answer}</Text>
                  <Flex justify="space-between" align="center">
                    <Stack direction="row" spacing={4}>
                      <Button
                        size="sm"
                        leftIcon={<ThumbsUp size={16} />}
                        onClick={() => feedbackMutation.mutate({ faqId: faq._id, isHelpful: true })}
                      >
                        Helpful
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<ThumbsDown size={16} />}
                        onClick={() => feedbackMutation.mutate({ faqId: faq._id, isHelpful: false })}
                      >
                        Not Helpful
                      </Button>
                    </Stack>
                    <Button
                      variant="ghost"
                      leftIcon={<Bookmark size={16} />}
                      onClick={() => bookmarkMutation.mutate(faq._id)}
                    >
                      Bookmark
                    </Button>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Stack>
    </Container>
  );
}
