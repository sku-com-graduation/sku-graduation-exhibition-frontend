import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

import Header from "../Header";
import Footer from "../Footer";

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled(motion.div)`
  box-sizing: border-box;
`;

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LayoutContainer>
    <Header />
    <Content
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeIn" }}
    >
      {children}
    </Content>
    <Footer />
  </LayoutContainer>
);

export default DefaultLayout;
