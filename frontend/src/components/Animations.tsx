import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export const MotionBox = motion(Box);

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
