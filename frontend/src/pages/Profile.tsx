import {
  Box,
  Heading,
  Container,
  Stack,
  Text,
  Avatar,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
} from '@chakra-ui/react';
import { Bookmark, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function Profile() {
  const { user } = useAuthStore();

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await apiClient.get('/users/bookmarks');
      return res.data;
    },
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/users/notifications');
      return res.data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Container py={20} textAlign="center">
        <Heading>Please login to view your profile</Heading>
      </Container>
    );
  }

  return (
    <Container maxW={'5xl'} py={10}>
      <Stack spacing={8}>
        <Flex align="center" direction={{ base: 'column', md: 'row' }} gap={6}>
          <Avatar size="2xl" name={user.name} />
          <Box textAlign={{ base: 'center', md: 'left' }}>
            <Heading size="2xl">{user.name}</Heading>
            <Text fontSize="xl" color="gray.500">{user.email}</Text>
            <Badge mt={2} colorScheme="brand" p={1} borderRadius="md">{user.role}</Badge>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.800">
            <StatLabel>Reputation Points</StatLabel>
            <StatNumber color="brand.400">{user.reputationPoints}</StatNumber>
          </Stat>
          <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.800">
            <StatLabel>Bookmarks</StatLabel>
            <StatNumber>{bookmarks?.length || 0}</StatNumber>
          </Stat>
          <Stat p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="gray.800">
            <StatLabel>Unread Notifications</StatLabel>
            <StatNumber>{notifications?.filter((n: any) => !n.isRead).length || 0}</StatNumber>
          </Stat>
        </SimpleGrid>

        <Divider />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <Heading size="md" mb={4}>Recent Bookmarks</Heading>
            <List spacing={3}>
              {bookmarks?.map((item: any) => (
                <ListItem key={item._id} p={3} bg="gray.800" borderRadius="md">
                  <ListIcon as={Bookmark} color="brand.400" />
                  {item.question || item.title}
                </ListItem>
              ))}
              {(!bookmarks || bookmarks.length === 0) && <Text color="gray.500">No bookmarks yet.</Text>}
            </List>
          </Box>
          <Box>
            <Heading size="md" mb={4}>Notifications</Heading>
            <List spacing={3}>
              {notifications?.map((n: any) => (
                <ListItem key={n._id} p={3} bg={n.isRead ? "gray.800" : "gray.700"} borderRadius="md">
                  <ListIcon as={Bell} color="brand.400" />
                  {n.message}
                </ListItem>
              ))}
              {(!notifications || notifications.length === 0) && <Text color="gray.500">No notifications.</Text>}
            </List>
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
