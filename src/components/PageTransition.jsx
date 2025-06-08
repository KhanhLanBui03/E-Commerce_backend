import { AnimatePresence, motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
      y: 20,
      filter: 'blur(8px)'
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(8px)',
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-[60vh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition; 