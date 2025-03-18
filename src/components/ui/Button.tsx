import { motion } from "framer-motion";
import styled from "styled-components";

export const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background-color: #0070f3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:hover {
    background-color: #005bb5;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const DeleteButton = styled(motion.button)`
  position: absolute;
  top: 0;
  right: 0;
  width: 1.5rem;
  height: 1.5rem;
  background: #ff6d6d;
  color: #fff;
  border: none;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;
