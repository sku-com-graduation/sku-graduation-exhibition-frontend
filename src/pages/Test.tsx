import { motion, Variants } from "framer-motion";
import BlackHoleImage from "@components/BlackHoleImage";

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
    <>
      <div
        style={{
          height: "100vh",
          background: "#f0e9e9",
          display: "flex",
          alignItems: "center",
        }}
      >
        <BlackHoleImage />
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.p variants={textVariants}>{`WHERE`}</motion.p>
          <motion.p variants={textVariants}>{`IDEAS`}</motion.p>
          <motion.p variants={textVariants}>{`BECOME`}</motion.p>
          <motion.p variants={textVariants}>{`REALITY`}</motion.p>
        </motion.div>
      </div>
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
          {/* <motion.h1 variants={textVariants}>{`title`}</motion.h1> */}
          <motion.p variants={textVariants}>{`WHERE`}</motion.p>
          <motion.p variants={textVariants}>{`IDEAS`}</motion.p>
          <motion.p variants={textVariants}>{`BECOME`}</motion.p>
          <motion.p variants={textVariants}>{`REALITY`}</motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default Test;
