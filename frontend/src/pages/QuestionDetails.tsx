import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Flex,
  HStack,
  Divider,
  Textarea,
  useToast,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { ArrowBigUp, ArrowBigDown, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useState } from 'react';

interface Answer {
  _id: string;
  content: string;
  author: { _id: string; name: string };
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; name: string };
  upvotes: number;
  createdAt: string;
}

interface QuestionDetailsResponse {
  question: Question;
  answers: Answer[];
}

export default function QuestionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [answerContent, setAnswerContent] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<QuestionDetailsResponse>({
    queryKey: ['question', id],
    queryFn: async () => {
      const res = await apiClient.get(`/questions/${id}?userId=${user?.id || ''}`);
      return res.data;
    },
  });

  const voteMutation = useMutation({
    mutationFn: (data: { type: 'question' | 'answer'; targetId: string; value: number }) => {
      const endpoint = data.type === 'question' 
        ? `/questions/${data.targetId}/vote` 
        : `/questions/answers/${data.targetId}/vote`;
      return apiClient.post(endpoint, { value: data.value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (content: string) => apiClient.post(`/questions/${id}/answers`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      setAnswerContent('');
      toast({ title: 'Answer submitted!', status: 'success' });
    },
  });

  const acceptAnswerMutation = useMutation({
    mutationFn: (answerId: string) => apiClient.post(`/questions/answers/${answerId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      toast({ title: 'Answer accepted!', status: 'success' });
    },
  });

  if (isLoading) return <Container py={10}><Text>Loading...</Text></Container>;
  if (!data?.question) return <Container py={10}><Text>Question not found</Text></Container>;

  const { question, answers } = data;

  return (
    <Container maxW={'4xl'} py={10}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>{question.title}</Heading>
          <HStack spacing={4} color="gray.500" fontSize="sm">
            <Text>Asked by <b>{question.author?.name}</b></Text>
            <Text>on {new Date(question.createdAt).toLocaleDateString()}</Text>
          </HStack>
        </Box>

        <Flex>
          <VStack mr={4} spacing={2}>
            <IconButton
              aria-label="Upvote"
              icon={<ArrowBigUp />}
              onClick={() => voteMutation.mutate({ type: 'question', targetId: question._id, value: 1 })}
              variant="ghost"
              colorScheme="brand"
            />
            <Text fontWeight="bold">{question.upvotes}</Text>
            <IconButton
              aria-label="Downvote"
              icon={<ArrowBigDown />}
              onClick={() => voteMutation.mutate({ type: 'question', targetId: question._id, value: -1 })}
              variant="ghost"
            />
          </VStack>
          <Box flex="1">
            <Text fontSize="lg" whiteSpace="pre-wrap">{question.content}</Text>
          </Box>
        </Flex>

        <Divider />

        <Heading size="md">{answers.length} Answers</Heading>

        {answers.map((answer) => (
          <Box key={answer._id} p={4} bg="gray.800" borderRadius="md" position="relative">
            <Flex>
              <VStack mr={4} spacing={2}>
                <IconButton
                  aria-label="Upvote"
                  icon={<ArrowBigUp />}
                  size="sm"
                  onClick={() => voteMutation.mutate({ type: 'answer', targetId: answer._id, value: 1 })}
                  variant="ghost"
                  colorScheme="brand"
                />
                <Text fontWeight="bold">{answer.upvotes}</Text>
                <IconButton
                  aria-label="Downvote"
                  icon={<ArrowBigDown />}
                  size="sm"
                  onClick={() => voteMutation.mutate({ type: 'answer', targetId: answer._id, value: -1 })}
                  variant="ghost"
                />
                {answer.isAccepted && (
                  <Box color="green.400">
                    <CheckCircle size={24} />
                  </Box>
                )}
              </VStack>
              <Box flex="1">
                <Text mb={4}>{answer.content}</Text>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.500">
                    Answered by <b>{answer.author?.name}</b>
                  </Text>
                  {question.author._id === user?.id && !answer.isAccepted && (
                    <Button
                      size="xs"
                      colorScheme="green"
                      onClick={() => acceptAnswerMutation.mutate(answer._id)}
                    >
                      Accept Answer
                    </Button>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}

        <Box pt={6}>
          <Heading size="sm" mb={4}>Your Answer</Heading>
          <Textarea
            placeholder="Type your answer here..."
            rows={6}
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            mb={4}
          />
          <Button
            colorScheme="brand"
            bg="brand.400"
            isDisabled={!isAuthenticated || !answerContent}
            onClick={() => submitAnswerMutation.mutate(answerContent)}
            isLoading={submitAnswerMutation.isPending}
          >
            Post Your Answer
          </Button>
          {!isAuthenticated && (
            <Text mt={2} fontSize="sm" color="red.400">Please login to answer questions.</Text>
          )}
        </Box>
      </VStack>
    </Container>
  );
}
