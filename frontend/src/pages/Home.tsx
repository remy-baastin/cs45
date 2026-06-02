import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, Users, Trophy } from 'lucide-react';
import { MotionBox, fadeIn } from '../components/Animations';

export default function Home() {
  return (
    <>
      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <MotionBox
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: '4xl', md: '6xl' }}
              lineHeight={'110%'}
            >
              Ask Anything. <br />
              <Text as={'span'} color={'brand.400'}>
                Get Expert Answers.
              </Text>
            </Heading>
          </MotionBox>
          <MotionBox
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Text color={'gray.500'}>
              Vicharanashala is the AI-powered crowdsourced platform for dynamic FAQs and community Q&A. 
              Join our community of knowledge seekers and contributors.
            </Text>
          </MotionBox>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Button
              as={Link}
              to="/questions"
              colorScheme={'brand'}
              bg={'brand.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'brand.500',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Get Started
            </Button>
            <Button
              as={Link}
              to="/faqs"
              variant={'link'}
              colorScheme={'blue'}
              size={'sm'}
            >
              Browse FAQs
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Box bg={useColorModeValue('gray.50', 'gray.900')} py={20}>
        <Container maxW={'6xl'}>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={10}
          >
            <Feature
              icon={<Icon as={Search} w={10} h={10} />}
              title={'AI Search'}
              text={'Search through our dynamic FAQs powered by semantic similarity.'}
            />
            <Feature
              icon={<Icon as={HelpCircle} w={10} h={10} />}
              title={'Community Q&A'}
              text={'Post questions and get answers from experts in the community.'}
            />
            <Feature
              icon={<Icon as={Users} w={10} h={10} />}
              title={'Contribution'}
              text={'Earn reputation points by providing helpful answers and feedback.'}
            />
            <Feature
              icon={<Icon as={Trophy} w={10} h={10} />}
              title={'Leaderboard'}
              text={'See where you stand among the top contributors of Vicharanashala.'}
            />
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
}

interface FeatureProps {
  title: string;
  text: string;
  icon: React.ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <MotionBox
      variants={fadeIn}
      whileHover={{ scale: 1.05, translateY: -5 }}
      p={5}
      shadow="xl"
      borderWidth="1px"
      flex="1"
      borderRadius="xl"
      bg={useColorModeValue('white', 'gray.800')}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'brand.400'}
        mb={4}
        shadow="md"
      >
        {icon}
      </Flex>
      <Text fontWeight={700} fontSize="xl" mb={2}>{title}</Text>
      <Text color={'gray.500'} lineHeight="tall">{text}</Text>
    </MotionBox>
  );
};

