import {
  Box,
  Heading,
  Container,
  Stack,
  Text,
  Button,
  Flex,
  Badge,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Select,
} from '@chakra-ui/react';
import { MessageSquare, ArrowBigUp } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: { name: string };
  upvotes: number;
  answerCount: number;
  createdAt: string;
}

export default function Questions() {
  const [sortBy, setSortBy] = useState<'recent' | 'upvoted' | 'unanswered'>('recent');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const { isAuthenticated } = useAuthStore();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: questions } = useQuery<Question[]>({
    queryKey: ['questions', sortBy],
    queryFn: async () => {
      const res = await apiClient.get(`/questions?sort=${sortBy}`);
      return res.data;
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      apiClient.post('/questions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      onClose();
      toast({ title: 'Question posted!', status: 'success' });
      setNewTitle('');
      setNewContent('');
    },
  });

  const handleCreate = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to ask a question', status: 'warning' });
      return;
    }
    createQuestionMutation.mutate({ title: newTitle, content: newContent });
  };

  return (
    <Container maxW={'4xl'} py={10}>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading>Community Questions</Heading>
        <Button colorScheme="brand" bg="brand.400" onClick={onOpen}>
          Ask a Question
        </Button>
      </Flex>

      <HStack mb={6}>
        <Text fontWeight="bold">Sort by:</Text>
        <Select w="200px" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="recent">Recent</option>
          <option value="upvoted">Most Upvoted</option>
          <option value="unanswered">Unanswered</option>
        </Select>
      </HStack>

      <Stack spacing={4}>
        {questions?.map((q) => (
          <Box
            key={q._id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg="gray.800"
            _hover={{ borderColor: 'brand.400' }}
            as={Link}
            to={`/questions/${q._id}`}
          >
            <Flex justify="space-between">
              <Box>
                <Heading size="md" mb={2}>
                  {q.title}
                </Heading>
                <Text noOfLines={2} color="gray.400" mb={4}>
                  {q.content}
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="purple">{q.author?.name || 'Anonymous'}</Badge>
                  <HStack spacing={1}>
                    <ArrowBigUp size={16} />
                    <Text fontSize="sm">{q.upvotes}</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <MessageSquare size={16} />
                    <Text fontSize="sm">{q.answerCount} answers</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>
              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.900">
          <ModalHeader>Ask a Community Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="What's your question?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea
                  placeholder="Describe your question in detail..."
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              bg="brand.400"
              onClick={handleCreate}
              isLoading={createQuestionMutation.isPending}
            >
              Post Question
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
