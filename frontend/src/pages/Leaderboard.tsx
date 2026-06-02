import {
  Box,
  Heading,
  Container,
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  HStack,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  reputationPoints: number;
  role: string;
}

export default function Leaderboard() {
  const { data: users, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await apiClient.get('/users/leaderboard?limit=20');
      return res.data;
    },
  });

  return (
    <Container maxW={'4xl'} py={10}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Top Contributors
          </Heading>
          <Text fontSize="xl" color="gray.500">
            Recognizing our community's most helpful members
          </Text>
        </Box>

        <Box bg="gray.800" borderRadius="lg" overflow="hidden" shadow="xl">
          <Table variant="simple">
            <Thead bg="gray.700">
              <Tr>
                <Th color="white">Rank</Th>
                <Th color="white">User</Th>
                <Th color="white">Role</Th>
                <Th isNumeric color="white">Reputation</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Tr key={i}>
                    <Td><Skeleton height="20px" /></Td>
                    <Td><Skeleton height="20px" /></Td>
                    <Td><Skeleton height="20px" /></Td>
                    <Td><Skeleton height="20px" /></Td>
                  </Tr>
                ))
              ) : (
                users?.map((user, index) => (
                  <Tr key={user._id} _hover={{ bg: 'gray.700' }}>
                    <Td fontWeight="bold">
                      {index === 0 && <Trophy size={20} color="#FFD700" style={{ display: 'inline', marginRight: '8px' }} />}
                      {index === 1 && <Trophy size={20} color="#C0C0C0" style={{ display: 'inline', marginRight: '8px' }} />}
                      {index === 2 && <Trophy size={20} color="#CD7F32" style={{ display: 'inline', marginRight: '8px' }} />}
                      #{index + 1}
                    </Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={user.name} />
                        <Text fontWeight="medium">{user.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.role === 'admin' ? 'red' : 'brand'}>{user.role}</Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold" color="brand.400">
                      {user.reputationPoints}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Stack>
    </Container>
  );
}
