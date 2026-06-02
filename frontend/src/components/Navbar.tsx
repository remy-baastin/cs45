import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link as ChakraLink,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            fontWeight="bold"
            color={useColorModeValue('gray.800', 'white')}
            as={Link}
            to="/"
          >
            Vicharanashala
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <Stack direction={'row'} spacing={4}>
              <ChakraLink as={Link} to="/faqs" p={2} fontSize={'sm'} fontWeight={500}>
                FAQs
              </ChakraLink>
              <ChakraLink as={Link} to="/questions" p={2} fontSize={'sm'} fontWeight={500}>
                Community
              </ChakraLink>
              <ChakraLink as={Link} to="/leaderboard" p={2} fontSize={'sm'} fontWeight={500}>
                Leaderboard
              </ChakraLink>
            </Stack>
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {isAuthenticated ? (
            <>
              <Text display={{ base: 'none', md: 'inline-flex' }} alignSelf="center">
                {user?.name}
              </Text>
              <Button
                as={Link}
                to="/profile"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
              >
                Profile
              </Button>
              <Button
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                _hover={{
                  bg: 'brand.400',
                }}
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                as={Link}
                to="/login"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
              >
                Sign In
              </Button>
              <Button
                as={Link}
                to="/register"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                _hover={{
                  bg: 'brand.400',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}
