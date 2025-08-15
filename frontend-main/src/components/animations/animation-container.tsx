"use client";

import { motion } from "framer-motion";

interface AnimationContainerProps {
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
  className?: string;
}

const AnimationContainer = ({
  children,
  className,
  reverse,
  delay,
}: AnimationContainerProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reverse ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{
        duration: 0.1,
        delay: delay,
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimationContainer;
