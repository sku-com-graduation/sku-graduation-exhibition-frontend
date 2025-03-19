import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Test = () => {
  return (
    <div
      style={{
        height: "100vh",
        background: "#FFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 variants={textVariants}>{`title`}</motion.h1>
        <motion.p variants={textVariants}>{`content`}</motion.p>
      </motion.div>
    </div>
  );
};

export default Test;
