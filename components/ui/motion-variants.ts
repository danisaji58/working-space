import { Variants } from 'framer-motion';

// Staggered Container for child elements
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

// Fade In Up - Clean and noticeable
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
    },
  },
};

// Fade In Down
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 280,
    },
  },
};

// Simple Fade In
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Scale In (for cards, dialogs, badges)
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 16,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 260,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2 },
  },
};

// Card Hover animation properties
export const cardHoverMotion = {
  whileHover: {
    y: -6,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Button press & hover
export const buttonMotion = {
  whileHover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 500, damping: 25 },
  },
  whileTap: {
    scale: 0.97,
  },
};

// FAQ Accordion Content animation
export const accordionVariants: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    overflow: 'visible',
    transition: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
  },
};

// Banner / Alert slide-down animation
export const alertSlideDown: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};
